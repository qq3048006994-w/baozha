import { useEffect, useRef } from 'react'
export default function Modal({ title, subtitle, onClose, children, wide = false }) {
  const root = useRef(null)
  useEffect(() => {
    const prior = document.activeElement
    const dialog = root.current
    dialog.focus()
    function keyboard(e) {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'Tab') {
        const items = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')]
        const first = items[0], last = items.at(-1)
        if (!first) { e.preventDefault(); return }
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { e.preventDefault(); first.focus() }
      }
    }
    dialog.addEventListener('keydown', keyboard)
    return () => { dialog.removeEventListener('keydown', keyboard); prior?.focus() }
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section ref={root} className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
      <header className="modal-header"><div><span className="eyebrow">开封府 · {subtitle || '案牍录'}</span><h2>{title}</h2></div><button className="close-button" onClick={onClose} aria-label="关闭面板">×</button></header>
      <div className="modal-body">{children}</div>
    </section>
  </div>
}
