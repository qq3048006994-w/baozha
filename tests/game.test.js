import test from 'node:test'
import assert from 'node:assert/strict'
import { gameReducer, newGame, caseComplete, linkEvidence, claimStatus } from '../src/engine/game.js'
import { claims } from '../src/data/evidence.js'
import { readSave, writeSave, validSave, SAVE_KEY } from '../src/utils/saveManager.js'

const act = (s, type, payload = {}) => gameReducer(s, { type, ...payload })
function trial() {
  let s = act(newGame(), 'START')
  for (let i=0;i<4;i++) s = act(s, 'PROLOGUE')
  return s
}
function fullCase() {
  let s = trial()
  for (const id of ['petition','token','investigate']) s=act(s,'ASK',{id})
  s=act(s,'ADVANCE',{id:'formal'})
  s=act(s,'LINK',{a:'token',b:'marriage',fact:'marriage'})
  for (const id of ['knife','scene','roster']) s=act(s,'ASK',{id})
  s=act(s,'LINK',{a:'knife',b:'scene',fact:'attack'})
  s=act(s,'ADVANCE',{id:'facts'})
  for(const id of ['register','witness']) s=act(s,'ASK',{id})
  s=act(s,'LINK',{a:'marriage',b:'register',fact:'conceal'})
  s=act(s,'LINK',{a:'roster',b:'witness',fact:'order'})
  for(const [id,evidence] of [['marriage','marriage'],['conceal','register'],['order','witness']]) s=act(s,'CHALLENGE',{id,evidence})
  return act(s,'ADVANCE',{id:'document'})
}
function sparseCase() {
  let s=trial()
  for (const id of ['formal','facts','document']) s=act(s,'ADVANCE',{id})
  return s
}
test('完整四审可依法昭雪，证物与质证均真实影响认定',()=>{
  const s=fullCase()
  assert.equal(s.round,3)
  assert.equal(caseComplete(s),true)
  assert.equal(act(s,'VERDICT',{verdict:'convict'}).ending,'justice')
  assert.equal(s.presented.includes('witness'),true)
})
test('缺查强断、暂缓与压案形成三种独立结局',()=>{
  const s=sparseCase()
  assert.equal(caseComplete(s),false)
  for(const [verdict,ending] of [['convict','reckless'],['defer','defer'],['submit','submit']]) assert.equal(act(s,'VERDICT',{verdict}).ending,ending)
})
test('遗刀不能直接证明授意，未复核不能质证',()=>{
  let s=trial(); s=act(s,'ADVANCE',{id:'formal'}); s=act(s,'ASK',{id:'knife'})
  assert.equal(linkEvidence(s,'knife','statement','order').ok,false)
  s=act(s,'ADVANCE',{id:'facts'}); s=act(s,'CHALLENGE',{id:'order',evidence:'knife'})
  assert.equal(s.challenged.includes('order'),false)
  assert.equal(s.collected.includes('contradiction'),false)
})
test('重复询问、关联和质证不会累计收益或重复写入',()=>{
  const s=fullCase()
  assert.deepEqual(act(s,'ASK',{id:'token'}),s)
  assert.deepEqual(act(s,'LINK',{a:'token',b:'marriage',fact:'marriage'}),s)
  assert.deepEqual(act(s,'INSPECT',{id:'nonexistent'}),s)
})
test('跳过前置调查无法凭空取得门吏证言和婚史回文',()=>{
  let s=sparseCase()
  assert.equal(s.collected.includes('marriage'),false)
  s={...s,round:2}
  assert.equal(act(s,'ASK',{id:'witness'}).collected.includes('witness'),false)
})
test('有材料但未完成关联或质证时，不认定授意与婚姻',()=>{
  const s=fullCase()
  assert.equal(caseComplete({...s,links:[]}),false)
  assert.equal(claimStatus({...s,challenged:[]},claims.find(c=>c.id==='order')),false)
  assert.equal(claimStatus({...s,collected:s.collected.filter(id=>id!=='scene')},claims.find(c=>c.id==='attack')),false)
})
test('存档往返、无存档、损坏及未知版本均有明确结果',()=>{
  const memory=new Map()
  const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}
  assert.equal(readSave(storage).state.phase,'new')
  const s=fullCase()
  assert.equal(writeSave(s,storage),null)
  assert.deepEqual(readSave(storage).state,s)
  memory.set(SAVE_KEY,'not json')
  assert.ok(readSave(storage).error)
  assert.equal(readSave(storage).state.phase,'new')
  memory.set(SAVE_KEY,JSON.stringify({...s,version:2}))
  assert.ok(readSave(storage).error)
  assert.equal(validSave({...s,collected:['unknown']}),false)
})
test('存储不可用时返回提示，不谎报已保存',()=>{
  const broken={getItem(){throw Error('denied')},setItem(){throw Error('quota')}}
  assert.ok(writeSave(fullCase(),broken))
  assert.ok(readSave(broken).error)
})
test('终审前不能提前裁决，非法选项不能推进',()=>{
  const s=trial()
  assert.deepEqual(act(s,'VERDICT',{verdict:'convict'}),s)
  assert.deepEqual(act(s,'ADVANCE',{id:'nonexistent'}),s)
})
test('结案后不得继续呈堂改写审理记录',()=>{
  const s=act(fullCase(),'VERDICT',{verdict:'convict'})
  assert.deepEqual(act(s,'PRESENT',{id:'knife'}),s)
})
