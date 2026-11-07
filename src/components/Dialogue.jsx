import { useEffect, useState } from 'react'
import { characters } from '../data/characters.js'

export function Portrait({ id, assets, className = '' }) {
  const character = characters[id] || characters.bao
  const asset = assets[id]
  const [failed, setFailed] = useState(false)
  const [x, y, width, height] = character.crop
  return <div className={`portrait ${className} ${asset?.url && !failed ? 'has-photo' : ''}`} style={{ '--person-color': character.color }}>
    {asset?.url && !failed ? <div className="portrait-crop" style={{ aspectRatio: asset.sheet ? `${width} / ${height}` : '3 / 4' }}>
      <img alt={character.name} src={asset.url} onError={() => setFailed(true)} style={asset.sheet ? { width: `${100 / width}%`, maxWidth: 'none', position: 'absolute', left: `${-x / width * 100}%`, top: `${-y / height * 100}%` } : { width: '100%', height: '100%', objectFit: 'contain' }}/>
    </div> : <div className="portrait-empty"><span className="portrait-moon"/><span className="portrait-seal">{character.seal}</span><strong>{character.name}</strong><small>人物原图待导入</small></div>}
  </div>
}
export default function Dialogue({ dialogue, speed, assets }) {
  const [count, setCount] = useState(speed === 0 ? dialogue.text.length : 0)
  const character = characters[dialogue.speaker] || characters.bao
  const full = count >= dialogue.text.length || speed === 0
  useEffect(() => {
    if (speed === 0) return
    const timer = setInterval(() => setCount(n => Math.min(n + 2, dialogue.text.length)), speed)
    return () => clearInterval(timer)
  }, [speed, dialogue.text.length])
  useEffect(() => {
    function keyboard(event) {
      if (event.key !== 'Enter' || event.repeat || event.target.closest('button, input, select, textarea, [role="dialog"]')) return
      event.preventDefault()
      if (full) document.getElementById('inquiry-list')?.focus()
      else setCount(dialogue.text.length)
    }
    document.addEventListener('keydown', keyboard)
    return () => document.removeEventListener('keydown', keyboard)
  }, [full, dialogue.text.length])
  return <section className="dialogue-paper" aria-label="当前对话">
    <div className="speaker-card"><Portrait key={assets[dialogue.speaker]?.url || dialogue.speaker} id={dialogue.speaker} assets={assets}/><span>{character.name}</span></div>
    <div className="dialogue-content"><div className="dialogue-byline"><strong>{character.name}</strong><span>{character.title}</span></div>
      <p>{full ? dialogue.text : dialogue.text.slice(0, count)}{!full && <span className="type-caret">▏</span>}</p>
      <button className="text-button reveal-button" onClick={() => full ? document.getElementById('inquiry-list')?.focus() : setCount(dialogue.text.length)}>{full ? '选择下方问话继续 ↓' : '显示完整台词 ↵'}</button>
    </div>
  </section>
}
