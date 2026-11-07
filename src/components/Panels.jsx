import { useState } from 'react'
import { evidence, claims, relations } from '../data/evidence.js'
import { characters, characterOrder } from '../data/characters.js'
import { chapters } from '../data/chapters.js'
import { assetManifest } from '../data/assets.js'
import { claimStatus, linkEvidence } from '../engine/game.js'
import { Portrait } from './Dialogue.jsx'

export function Casebook({ state, onEvidence }) {
  return <><p className="panel-lead">秦香莲诉陈世美案 <span className="subtle">／ 案号·庆历壹号</span></p><p className="muted">所见不等于所证。以下事实按已取得材料、关联与当堂质证实时整理。</p>
    <div className="claim-list">{claims.map(claim => <div key={claim.id} className={`claim ${claimStatus(state, claim) ? 'verified' : ''}`}>
      <div className="claim-top"><h3>{claim.name}</h3><span className="status-stamp">{claimStatus(state, claim) ? '已核实' : '待核实'}</span></div><p>{claim.subtitle}</p>
      <small>材料：{claim.needs.map(id => `${state.collected.includes(id) ? '●' : '○'} ${evidence[id].name}`).join('　')}</small>
      <small>关联：{state.links.includes(claim.relation) ? '已核对' : '尚未完成'}{claim.id !== 'attack' && ` · 质证：${state.challenged.includes(claim.id) ? '已完成' : '尚未完成'}`}</small>
    </div>)}</div>
    <button className="button dark" onClick={onEvidence}>展开证物 · 建立关联 →</button>
    <h3 className="section-label">调查时间线</h3><ol className="timeline">{['均州成婚，陈世美赴京', '荒年丧亲，秦氏携儿女寻夫', '驸马拒认，韩琪追至三官堂', '遗刀呈堂，四审查证'].map(t => <li key={t}>{t}</li>)}</ol>
    <p className="fineprint">本作改编自民间故事。核验回文、出入簿、申报副本、门吏证言与质证笔录为游戏原创，非真实历史档案。</p></>
}
export function EvidencePanel({ state, dispatch, notify }) {
  const [selected, setSelected] = useState(state.collected[0] || '')
  const [a, setA] = useState(''), [b, setB] = useState(''), [fact, setFact] = useState('marriage')
  const [feedback, setFeedback] = useState('')
  const item = evidence[selected]
  function correlate() {
    const result = linkEvidence(state, a, b, fact)
    setFeedback(result.text)
    if (result.ok) { dispatch({ type: 'LINK', a, b, fact }); notify('证据关联已记入案卷') }
  }
  return <><div className="evidence-layout"><div className="evidence-list">{state.collected.length === 0 && <p>尚未取得证物。</p>}{state.collected.map(id => <button key={id} className={`evidence-row ${selected === id ? 'selected' : ''}`} onClick={() => { setSelected(id); dispatch({ type: 'INSPECT', id }) }}>
    <span className="evidence-glyph">{evidence[id].glyph}</span><span>{evidence[id].name}<small>{state.presented.includes(id) ? '已呈堂' : state.inspected.includes(id) ? '已查看' : '待查看'}</small></span><span>›</span>
  </button>)}</div>{item && <article className="evidence-detail"><span className="evidence-hero">{item.glyph}</span><span className="eyebrow">第{['一','二','三','四'][item.round-1]}审取得 · {item.original ? '本作原创材料' : '民间故事线索'}</span><h3>{item.name}</h3><dl><dt>来源</dt><dd>{item.source}</dd><dt>关联人物</dt><dd>{item.person}</dd><dt>能够支持</dt><dd>{item.supports}</dd><dt>证明边界</dt><dd className="red-ink">{item.limits}</dd></dl><button className="button dark" disabled={state.phase !== 'trial' || state.presented.includes(selected)} onClick={() => { dispatch({ type: 'PRESENT', id: selected }); notify('证物已呈堂；认定事实仍需关联与质证') }}>{state.phase !== 'trial' ? '已结案 · 仅供查阅' : state.presented.includes(selected) ? '已收入呈堂记录' : '呈堂收录'}</button></article>}</div>
    {state.phase === 'trial' && <section className="association"><h3>证据关联 <small>两份材料，核对一项事实</small></h3><div className="association-fields"><label>材料甲<select aria-label="材料甲" value={a} onChange={e => setA(e.target.value)}><option value="">请选择</option>{state.collected.map(id => <option key={id} value={id}>{evidence[id].name}</option>)}</select></label><span className="link-sign">⟷</span><label>材料乙<select aria-label="材料乙" value={b} onChange={e => setB(e.target.value)}><option value="">请选择</option>{state.collected.map(id => <option key={id} value={id}>{evidence[id].name}</option>)}</select></label><label>要核实的事实<select aria-label="要核实的事实" value={fact} onChange={e => setFact(e.target.value)}>{claims.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button className="button cinnabar" onClick={correlate}>核对</button></div><p role="status" className="association-feedback">{feedback || '提示：婚姻看旧信物与回文；隐瞒看回文与申报；追逐看遗刀与勘验；指令看出入簿与门吏证言。'}</p><div className="link-tags">{state.links.map(id => <span key={id}>✓ {relations[id].fact}</span>)}</div></section>}
  </>
}
export function PeoplePanel({ state, assets, playing }) {
  const [id, setId] = useState('bao')
  const character = characters[id]
  const unlocked = !playing || ['bao', 'qin'].includes(id) || (state.round >= 1 && id === 'han') || (state.round >= 2 && id === 'chen') || state.round >= 3
  const known = state.history.filter(h => h.speaker === id)
  return <><nav className="person-tabs" aria-label="选择人物">{characterOrder.map(key => <button key={key} className={key === id ? 'active' : ''} onClick={() => setId(key)}>{characters[key].name}</button>)}</nav><div className="person-profile"><Portrait key={assets[id]?.url || id} id={id} assets={assets}/><article><span className="eyebrow">人物志 · {unlocked ? '基本档案' : '尚未到场'}</span><h3>{character.name}</h3><p className="person-title">{character.title}</p><p>{character.description}</p><p className="muted">{character.relationship}</p>{playing && known.length > 0 && <blockquote>{known.at(-1).text}</blockquote>}{playing && id === 'chen' && <p className="red-ink">已质证矛盾：{state.challenged.length ? state.challenged.map(x => claims.find(c => c.id === x)?.name).join('、') : '尚无'}</p>}{!playing && <p className="muted">供述与矛盾将在审理过程中写入档案。</p>}</article></div></>
}
export function HistoryPanel({ state }) {
  return <>{state.history.length === 0 && <p className="muted">惊堂木未落，案卷尚空。</p>}<div className="history-list">{state.history.map((h, i) => <article key={i}><span className="eyebrow">第{['一','二','三','四'][h.round]}审 · {characters[h.speaker]?.name || '记录'}</span><p>{h.text}</p></article>)}</div><h3>审理抉择</h3>{state.choices.map((c, i) => <p key={i}>{chapters[c.round].short} · {c.title}</p>)}</>
}
export function SettingsPanel({ settings, setSettings, assets, onUpload }) {
  const [sheet, setSheet] = useState(true)
  const [status, setStatus] = useState('')
  async function upload(id, file) {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) { setStatus('请选择 12MB 以内的 PNG、JPG 或 WebP 图片。'); return }
    try { await onUpload(id, file, ['court', 'poster'].includes(id) ? false : sheet); setStatus(`${assetManifest[id].label}已导入此浏览器，刷新后仍可使用。`) }
    catch { setStatus('图片未能保存。请检查浏览器存储权限，并确认图片能够正常打开。') }
  }
  return <><div className="setting-row"><label htmlFor="text-speed">文字速度</label><select id="text-speed" value={settings.speed} onChange={e => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}><option value={55}>缓缓道来</option><option value={28}>从容叙说</option><option value={0}>立即显示</option></select></div><div className="setting-row"><label htmlFor="motion">场景动画</label><input id="motion" type="checkbox" checked={settings.motion} onChange={e => setSettings(s => ({ ...s, motion: e.target.checked }))}/></div><p className="muted">本版本暂无音频。快捷键：Enter 显示完整台词，Esc 关闭案卷。逐字显示可直接跳过，不代替玩家作答。</p>
    <section className="asset-settings"><h3>原图入卷</h3><p>聊天中的图片尚未成为项目文件。可将你的原图导入对应位置；图片只存于当前浏览器，不上传网络。若要随代码分发，请按运行说明配置素材路径。</p><label className="sheet-toggle"><input type="checkbox" checked={sheet} onChange={e => setSheet(e.target.checked)}/>导入的是多角度人物设定图（自动截取正面头像区域）</label><div className="asset-grid">{Object.entries(assetManifest).map(([id, slot]) => <label key={id} className="asset-slot"><span>{slot.label}</span><small>{assets[id]?.url ? '已接入 · 可更换' : '待导入'}</small><input aria-label={`导入${slot.label}`} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { upload(id, e.target.files[0]); e.target.value = '' }}/></label>)}</div><p role="status" className="red-ink">{status}</p></section></>
}
