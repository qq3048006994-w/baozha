import { newGame } from '../engine/game.js'
import { evidence, relations } from '../data/evidence.js'
import { chapters } from '../data/chapters.js'

export const SAVE_KEY = 'kaizha.save.v1'
export const SETTINGS_KEY = 'kaizha.settings.v1'
export const defaultSettings = { speed: 28, motion: true }
export function validSave(s) {
  const array = (key, ids) => Array.isArray(s[key]) && s[key].every(x => typeof x === 'string' && (!ids || ids.includes(x)))
  const questions = chapters.flatMap(c => c.questions.map(q => q.id))
  return s && s.version === 1 && ['prologue', 'trial', 'ending'].includes(s.phase) && Number.isInteger(s.round) && s.round >= 0 && s.round <= 3 && Number.isInteger(s.prologue) && s.prologue >= 0 && s.prologue <= 3 && ['collected', 'inspected', 'presented'].every(k => array(k, Object.keys(evidence))) && array('asked', questions) && array('links', Object.keys(relations)) && array('challenged', ['marriage', 'conceal', 'order']) && array('flags', ['investigateMarriage']) && Array.isArray(s.choices) && s.choices.every(c => c && Number.isInteger(c.round) && typeof c.id === 'string' && typeof c.title === 'string') && Array.isArray(s.history) && s.history.every(h => h && Number.isInteger(h.round) && typeof h.speaker === 'string' && typeof h.text === 'string') && s.dialogue && typeof s.dialogue.text === 'string' && typeof s.dialogue.speaker === 'string' && Number.isFinite(s.pressure) && (s.phase !== 'ending' || ['justice', 'defer', 'submit', 'reckless'].includes(s.ending))
}
export function readSave(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(SAVE_KEY)
    if (!raw) return { state: newGame(), error: null }
    const state = JSON.parse(raw)
    if (!validSave(state)) throw Error('invalid')
    return { state, error: null }
  } catch { return { state: newGame(), error: '存档无法读取或版本不兼容。可重新开案；原存档尚未覆盖。' } }
}
export function writeSave(state, storage = globalThis.localStorage) {
  if (state.phase === 'new') return null
  try { storage.setItem(SAVE_KEY, JSON.stringify(state)); return null }
  catch { return '当前无法保存，刷新可能丢失进度。请检查浏览器存储权限或空间。' }
}
export function readSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY))
    return { speed: [0, 28, 55].includes(s?.speed) ? s.speed : 28, motion: s?.motion !== false }
  } catch { return defaultSettings }
}
