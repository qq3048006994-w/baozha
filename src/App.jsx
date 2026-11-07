import { useCallback, useEffect, useReducer, useState } from 'react'
import Court from './components/Court.jsx'
import Dialogue from './components/Dialogue.jsx'
import Modal from './components/Modal.jsx'
import { Casebook, EvidencePanel, PeoplePanel, HistoryPanel, SettingsPanel } from './components/Panels.jsx'
import { chapters, prologue } from './data/chapters.js'
import { endings } from './data/endings.js'
import { claims, evidence } from './data/evidence.js'
import { assetManifest } from './data/assets.js'
import { gameReducer, caseComplete, claimStatus, availableQuestion } from './engine/game.js'
import { readSave, writeSave, readSettings, SETTINGS_KEY } from './utils/saveManager.js'
import { loadAssets, storeAsset } from './utils/assetStore.js'
import './App.css'

function App() {
  const [initial] = useState(readSave)
  const [state, dispatch] = useReducer(gameReducer, initial.state)
  const [view, setView] = useState('home')
  const [panel, setPanel] = useState(null)
  const [settings, setSettings] = useState(readSettings)
  const [assets, setAssets] = useState(assetManifest)
  const [toast, setToast] = useState('')
  const [storageError, setStorageError] = useState(initial.error)
  const [challengeId, setChallengeId] = useState('marriage')
  const [chosenEvidence, setChosenEvidence] = useState('')
  const [verdict, setVerdict] = useState(null)
  const chapter = chapters[state.round]
  const playing = view === 'game' && state.phase !== 'new'
  const closePanel = useCallback(() => setPanel(null), [])

  useEffect(() => {
    const error = writeSave(state)
    if (state.phase !== 'new') queueMicrotask(() => setStorageError(error))
  }, [state])
  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) }
    catch { queueMicrotask(() => setStorageError('浏览器无法保存设置，请检查存储权限。')) }
  }, [settings])
  useEffect(() => {
    let active = true
    const urls = []
    loadAssets().then(saved => {
      if (!active) return
      const entries = Object.entries(saved).filter(([id]) => id in assetManifest).map(([id, asset]) => {
        const url = URL.createObjectURL(asset.blob); urls.push(url)
        return [id, { ...assetManifest[id], url, sheet: asset.sheet }]
      })
      setAssets(a => ({ ...a, ...Object.fromEntries(entries) }))
    }).catch(() => { if (active) setToast('此浏览器暂不能保存图片，可使用项目素材路径。') })
    return () => { active = false; urls.forEach(url => URL.revokeObjectURL(url)) }
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  async function uploadAsset(id, file, sheet) {
    const bitmap = await createImageBitmap(file)
    bitmap.close()
    await storeAsset(id, file, sheet)
    const url = URL.createObjectURL(file)
    setAssets(current => {
      if (current[id].url?.startsWith('blob:')) URL.revokeObjectURL(current[id].url)
      return { ...current, [id]: { ...assetManifest[id], url, sheet } }
    })
  }
  function start() {
    if (state.phase !== 'new') { setPanel('restart'); return }
    dispatch({ type: 'START' }); setView('game')
  }
  function restart() { dispatch({ type: 'START' }); setPanel(null); setVerdict(null); setView('game') }
  function advance(id) { dispatch({ type: 'ADVANCE', id }); setPanel(null); setToast('本审已封录，进入下一审') }
  const panelTitles = { casebook: '案卷', evidence: '证物房', people: '人物志', history: '审理记录', settings: '游戏设置', decision: '本审封录', challenge: '当堂质证', verdict: '终审判牍', restart: '重新开案' }

  return <div className={`app ${!settings.motion ? 'reduce-motion' : ''}`}>
    <div className="app-main" inert={panel ? true : undefined}>
      <Court home={view === 'home'} image={(view === 'home' ? assets.poster.url || assets.court.url : assets.court.url)}/>
      <header className="topbar"><button className="brand" aria-label="返回《开铡》首页" onClick={() => setView('home')}><span className="brand-mark">铡</span><span>开铡<small>开封府 · 审案录</small></span></button><div className="topbar-right"><span className="edition">互动叙事 · 民间故事改编</span><button className="quiet-button" onClick={() => setPanel('settings')} aria-label="打开游戏设置">设置 <span>⚙</span></button></div></header>
      {storageError && <div className="storage-warning" role="alert">{storageError}</div>}
      {view === 'home' || state.phase === 'new' ? <main className="home-page">
        <div className="home-copy"><div className="home-kicker"><span className="small-line"/> 北宋 · 庆历年间 <span className="small-line"/></div><div className="home-title"><h1>开<span>铡</span></h1><span className="title-seal">法不<br/>阿贵</span></div><p className="home-subtitle">一纸诉状，四堂审判。</p><p className="home-question">公堂之上，究竟是王法，还是王权？</p><div className="home-menu"><button className="start-button" onClick={start}><span>开始审案</span><span className="arrow">⟶</span></button><button className="continue-button" disabled={state.phase === 'new'} onClick={() => setView('game')}>{state.phase === 'new' ? '继续案件 · 尚无存档' : `继续案件 · ${state.phase === 'ending' ? '结案回顾' : `第${['一','二','三','四'][state.round]}审`}`}<span>↗</span></button><div className="home-links"><button onClick={() => setPanel('people')}>人物志</button><span>／</span><button onClick={() => setPanel('settings')}>设置与素材</button></div></div></div>
        <aside className="home-aside"><span className="vertical-verse">不问贵贱<span>只问是非</span></span><div className="case-note"><span className="eyebrow">本案 · 陈世美负心案</span><p>一位母亲。<br/>一把遗刀。<br/>一场不能退让的审判。</p><span className="case-note-bottom">你是包拯，裁断在你。 <span>壹—肆</span></span></div></aside>
        <footer className="home-footer"><span>听供 · 查证 · 质询 · 裁决</span><span>河南大学校园黑客松 · 第一版</span></footer>
      </main> : state.phase === 'prologue' ? <main className="prologue-page"><span className="eyebrow">案前叙 · {prologue[state.prologue].tag}</span><span className="prologue-number">{['壹','贰','叁','肆'][state.prologue]}</span><h1>{prologue[state.prologue].title}</h1><p>{prologue[state.prologue].text}</p><div className="prologue-bottom"><span>{prologue.map((_, i) => <i className={i <= state.prologue ? 'current' : ''} key={i}/>)}</span><button className="button parchment" onClick={() => dispatch({ type: 'PROLOGUE' })}>{state.prologue === 3 ? '惊堂木落 · 开始第一审' : '继续案前叙'} →</button></div></main> : state.phase === 'ending' ? <main className={`ending-page ending-${state.ending}`}><span className="eyebrow">案终 · {endings[state.ending].label}</span><span className="ending-seal">{endings[state.ending].seal}</span><h1>{endings[state.ending].name}</h1><p className="ending-line">{endings[state.ending].line}</p><div className="ending-narrative"><p>{endings[state.ending].text}</p><p>{endings[state.ending].after}</p></div><div className="ending-summary">{claims.map(c => <span key={c.id} className={claimStatus(state, c) ? 'done' : ''}>{claimStatus(state, c) ? '●' : '○'} {c.name}</span>)}</div><div className="ending-actions"><button className="button parchment" onClick={() => setPanel('casebook')}>回看案卷</button><button className="button outline" onClick={() => setPanel('history')}>审理回顾</button><button className="button outline" onClick={() => setPanel('restart')}>重新审理</button><button className="text-button" onClick={() => setView('home')}>返回首页</button></div></main> : <main className="trial-page">
        <nav className="chapter-progress" aria-label="四审进度">{chapters.map((c, i) => <div key={c.number} className={`${i === state.round ? 'current' : ''} ${i < state.round ? 'finished' : ''}`} aria-current={i === state.round ? 'step' : undefined}><span className="chapter-number">{i < state.round ? '结' : c.number}</span><span>第{['一','二','三','四'][i]}审<small>{c.short}</small></span>{i < 3 && <i/>}</div>)}</nav>
        <div className="trial-body"><div className="scene-caption"><span className="eyebrow">{chapter.location}</span><h1>{chapter.title}</h1><p>{chapter.subtitle}</p></div><aside className="case-rail"><button onClick={() => setPanel('casebook')}><span>卷</span>案卷</button><button onClick={() => setPanel('evidence')}><span>证</span>证物<small>{state.collected.length}</small></button><button onClick={() => setPanel('people')}><span>人</span>人物</button><button onClick={() => setPanel('history')}><span>录</span>记录</button></aside><div className="scene-notice"><span className="dot"/> {assets.court.url ? '开封府 · 堂审中' : '场景示意 · 可在设置导入公堂原图'}</div><div className="pressure-note">朝堂来风 <span>{state.pressure >= 5 ? '风声渐紧' : state.pressure >= 2 ? '暗流初起' : '尚且平静'}</span></div></div>
        <div className="trial-controls"><Dialogue key={`${state.dialogue.text}-${settings.speed}`} dialogue={state.dialogue} speed={settings.speed} assets={assets}/><section className="inquiry-section" aria-label="审问选项"><div className="inquiry-heading"><span>此刻问案</span><small>{chapter.goal}</small></div><div id="inquiry-list" className="inquiry-list" tabIndex={-1}>{chapter.questions.map((q, i) => <button key={q.id} className={`question-button ${state.asked.includes(q.id) ? 'asked' : ''}`} disabled={state.asked.includes(q.id) || !availableQuestion(state, q)} onClick={() => dispatch({ type: 'ASK', id: q.id })}><span className="question-index">{state.asked.includes(q.id) ? '✓' : `0${i+1}`}</span><span>{q.title}{!availableQuestion(state, q) && <small>先完成相关询问与取证</small>}</span><span className="question-arrow">↗</span></button>)}{state.round === 2 && <button className="question-button challenge-entry" onClick={() => { setChosenEvidence(''); setPanel('challenge') }}><span className="question-index">质</span><span>选择供词，呈证质询<small>已完成 {state.challenged.length} / 3 项质证</small></span><span>↗</span></button>}</div></section><div className="trial-bottom"><span><span className="save-dot"/> 自动存档{storageError ? '受限' : '已开启'}<small> · 可随时回看案卷</small></span><button className="button cinnabar" onClick={() => { setVerdict(null); setPanel(state.round === 3 ? 'verdict' : 'decision') }}>{state.round === 3 ? '复核案卷 · 终审裁决' : '结束本审 · 封录'} <span>→</span></button></div></div>
      </main>}
    </div>
    {panel && <Modal title={panelTitles[panel]} subtitle={panel === 'settings' ? '静心调校' : '据实录入'} onClose={closePanel} wide={['casebook','evidence','people','verdict'].includes(panel)}>
      {panel === 'casebook' && <Casebook state={state} onEvidence={() => setPanel('evidence')}/>}
      {panel === 'evidence' && <EvidencePanel state={state} dispatch={dispatch} notify={setToast}/>}
      {panel === 'people' && <PeoplePanel state={state} assets={assets} playing={playing}/>}
      {panel === 'history' && <HistoryPanel state={state}/>}
      {panel === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} assets={assets} onUpload={uploadAsset}/>}
      {panel === 'restart' && <><p className="panel-lead">另起一卷，重新审理？</p><p>当前案件进度将被新案覆盖，设置与导入的原图会保留。不会影响其他网站数据。</p><div className="modal-actions"><button className="button dark" onClick={restart}>确认重新开案</button><button className="button light-outline" onClick={closePanel}>保留当前案件</button></div></>}
      {panel === 'decision' && <><p className="panel-lead">{chapter.decision.title}</p><p className="muted">未完成的调查会保留为疑点，带入后续审理。不会替你补齐证据。</p><div className="decision-options">{chapter.decision.options.map(o => <button key={o.id} onClick={() => advance(o.id)}><strong>{o.title}<span>→</span></strong><p>{o.text}</p></button>)}</div><button className="text-button" onClick={closePanel}>返回本审，继续查问</button></>}
      {panel === 'challenge' && <><p className="muted">先在证物房核对关联，再把材料呈给具体供词。无关证据不会自动奏效。</p><div className="challenge-choices">{chapters[2].challenges.map(c => <button key={c.id} className={challengeId === c.id ? 'selected' : ''} onClick={() => setChallengeId(c.id)} disabled={state.challenged.includes(c.id)}>{state.challenged.includes(c.id) ? '✓ ' : ''}{c.title}</button>)}</div><label className="field-label">呈堂材料<select value={chosenEvidence} onChange={e => setChosenEvidence(e.target.value)}><option value="">选择已取得的材料</option>{state.collected.map(id => <option key={id} value={id}>{evidence[id].name}</option>)}</select></label><p className="red-ink">{state.dialogue.speaker === 'chen' && state.dialogue.text}</p><div className="modal-actions"><button className="button cinnabar" disabled={!chosenEvidence || state.challenged.includes(challengeId)} onClick={() => { dispatch({ type: 'CHALLENGE', id: challengeId, evidence: chosenEvidence }); setToast('质询回应已写入审理记录') }}>呈证质询</button><button className="button light-outline" onClick={() => setPanel('evidence')}>核对证据关联</button></div></>}
      {panel === 'verdict' && <><p className="panel-lead">有一分凭据，写一分判词。</p><div className="verdict-facts">{claims.map(c => <div key={c.id}><span>{c.name}</span><strong className={claimStatus(state,c) ? 'verified-text' : 'red-ink'}>{claimStatus(state,c) ? '核实及质证已完成' : '仍有证据缺口'}</strong></div>)}</div><p className="muted">{caseComplete(state) ? '四项事实均有可追溯的材料、关联与质证。裁决仍由你作出。' : '关键调查尚未完成。你可以暂缓再审；强行定罪将留下无据裁断的风险。'}</p><div className="verdict-options">{[['convict','坚持依法定罪','依现有案卷裁断陈世美罪责'],['defer','暂缓定案，继续调查','保护苦主，封录材料，保留疑点'],['submit','遵从皇室，压下此案','以皇家颜面为由停止追究']].map(([id,title,text]) => <button key={id} className={verdict === id ? 'selected' : ''} onClick={() => setVerdict(id)}><strong>{title}</strong><small>{text}</small></button>)}</div>{verdict && <div className="verdict-confirm"><p>{verdict === 'convict' && !caseComplete(state) ? '你正在以尚有缺口的证据定罪。请确认愿意承担这一裁断的后果。' : '判词一落，便写入本案结局。请确认你的裁决。'}</p><button className="button cinnabar" onClick={() => { dispatch({ type: 'VERDICT', verdict }); setPanel(null) }}>确认裁决 · 落印</button></div>}</>}
    </Modal>}
    {toast && <div className="toast" role="status"><span>录</span>{toast}</div>}
  </div>
}
export default App
