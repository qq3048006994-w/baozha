import { chapters } from '../data/chapters.js'
import { evidence, claims, relations } from '../data/evidence.js'

export function newGame() {
  return { version: 1, phase: 'new', round: 0, prologue: 0, collected: [], inspected: [], presented: [], asked: [], links: [], challenged: [], flags: [], choices: [], history: [], pressure: 0, ending: null, dialogue: { speaker: 'bao', text: '' } }
}
const append = (items, ...values) => [...new Set([...items, ...values])]
const note = (state, speaker, text) => ({ ...state, dialogue: { speaker, text }, history: [...state.history, { round: state.round, speaker, text }] })
export function claimStatus(state, claim) {
  return claim.needs.every(id => state.collected.includes(id)) && state.links.includes(claim.relation) && (claim.id === 'attack' || state.challenged.includes(claim.id))
}
export function caseComplete(state) { return claims.every(claim => claimStatus(state, claim)) }
export function resolveEnding(state, verdict) {
  if (verdict === 'submit') return 'submit'
  if (verdict === 'defer') return 'defer'
  return caseComplete(state) ? 'justice' : 'reckless'
}
export function availableQuestion(state, question) {
  return (!question.requires || question.requires.every(id => state.asked.includes(id))) && (!question.requiresEvidence || question.requiresEvidence.every(id => state.collected.includes(id)))
}
export function linkEvidence(state, a, b, fact) {
  if (a === b || !state.collected.includes(a) || !state.collected.includes(b)) return { ok: false, text: '请选择两份已经取得的不同材料。' }
  const relation = relations[fact]
  if (!relation || !relation.pair.every(id => [a, b].includes(id))) return { ok: false, text: '这组材料不足以核实所选事实。请核对两份材料的证明边界，线索相近不等于互相印证。' }
  return { ok: true, id: fact, text: relation.success }
}
export function gameReducer(state, action) {
  switch (action.type) {
    case 'START': return { ...newGame(), phase: 'prologue' }
    case 'PROLOGUE': {
      if (state.phase !== 'prologue') return state
      if (state.prologue < 3) return { ...state, prologue: state.prologue + 1 }
      return note({ ...state, phase: 'trial', collected: ['statement'] }, 'qin', chapters[0].opening)
    }
    case 'ASK': {
      if (state.phase !== 'trial') return state
      const question = chapters[state.round].questions.find(q => q.id === action.id)
      if (!question || state.asked.includes(action.id) || !availableQuestion(state, question)) return state
      return note({ ...state, asked: append(state.asked, question.id), collected: append(state.collected, ...(question.grant || [])), flags: append(state.flags, ...(question.flag ? [question.flag] : [])), pressure: Math.max(0, state.pressure + (question.pressure || 0)) }, question.speaker, question.text)
    }
    case 'INSPECT': return state.collected.includes(action.id) && !state.inspected.includes(action.id) ? { ...state, inspected: append(state.inspected, action.id) } : state
    case 'PRESENT': return state.phase === 'trial' && state.collected.includes(action.id) && !state.presented.includes(action.id) ? note({ ...state, presented: append(state.presented, action.id) }, 'bao', `呈堂收录：${evidence[action.id].name}。${evidence[action.id].limits}`) : state
    case 'LINK': {
      if (state.phase !== 'trial') return state
      const result = linkEvidence(state, action.a, action.b, action.fact)
      if (!result.ok || state.links.includes(result.id)) return state
      return note({ ...state, links: append(state.links, result.id) }, 'bao', result.text)
    }
    case 'CHALLENGE': {
      if (state.phase !== 'trial' || state.round !== 2) return state
      const challenge = chapters[2].challenges.find(c => c.id === action.id)
      if (!challenge || state.challenged.includes(action.id)) return state
      if (action.evidence !== challenge.evidence || !state.collected.includes(action.evidence) || !state.links.includes(challenge.requires)) return note(state, 'chen', '大人，这份材料能证明您所问的事么？请将来历核实，再谈它与供词之间的矛盾。')
      return note({ ...state, challenged: append(state.challenged, challenge.id), presented: append(state.presented, action.evidence), collected: append(state.collected, ...(challenge.grant || [])) }, 'chen', challenge.text)
    }
    case 'ADVANCE': {
      if (state.phase !== 'trial' || state.round >= 3) return state
      const decision = chapters[state.round].decision.options.find(o => o.id === action.id)
      if (!decision) return state
      let next = { ...state, choices: [...state.choices, { round: state.round, id: decision.id, title: decision.title }], pressure: state.pressure + decision.pressure }
      next = note(next, 'bao', decision.text)
      next = { ...next, round: state.round + 1 }
      if (next.round === 1 && next.flags.includes('investigateMarriage')) next = note({ ...next, collected: append(next.collected, 'marriage') }, 'bao', '前审所发均州核验已回。乡里婚约与儿女记录相合，回文已收入案卷。须与旧信物关联，并在第三审呈堂质询。')
      return note(next, chapters[next.round].speaker, chapters[next.round].opening)
    }
    case 'VERDICT': {
      if (state.phase !== 'trial' || state.round !== 3 || !['convict', 'defer', 'submit'].includes(action.verdict)) return state
      return { ...state, phase: 'ending', ending: resolveEnding(state, action.verdict), choices: [...state.choices, { round: 3, id: action.verdict, title: { convict: '依法定罪', defer: '暂缓再审', submit: '遵旨封案' }[action.verdict] }] }
    }
    default: return state
  }
}
