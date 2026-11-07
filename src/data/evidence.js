export const evidence = {
  statement: { name: '秦氏诉状', glyph: '诉', source: '秦香莲到堂陈述', round: 1, person: '秦香莲', supports: '婚姻、寻夫与追杀经过的调查起点。', limits: '单方陈述尚需旁证；不能直接认定被告全部罪责。' },
  token: { name: '旧日信物', glyph: '结', source: '秦香莲随身携带的旧绣囊', round: 1, person: '秦香莲、陈世美', supports: '双方可能具有共同生活经历，提供婚姻核验线索。', limits: '持有物品不等于婚姻已经得到独立证实。' },
  marriage: { name: '均州核验回文', glyph: '籍', source: '按第一审调查安排取得的乡里、婚姻核验', round: 2, person: '秦香莲、陈世美', supports: '核实婚姻早于陈世美入京，及二人育有儿女。', limits: '不能证明追杀，也不能单独证明陈向皇室如何申报。', original: true },
  knife: { name: '韩琪遗刀', glyph: '刀', source: '秦香莲自三官堂带回，经堂上查看', round: 2, person: '韩琪', supports: '与秦氏所述追逐事件有关的重要实物线索。', limits: '钢刀本身不能说话，更不能单独证明陈世美下令。' },
  scene: { name: '三官堂勘验', glyph: '勘', source: '差役查访、现场记录及秦氏陈述核对', round: 2, person: '秦香莲、韩琪', supports: '交叉核实韩琪追逐母子、持刀威胁而后自尽的经过。', limits: '只能核实所见行为，尚不能确认背后的指令来源。', original: true },
  roster: { name: '驸马府出入簿', glyph: '簿', source: '第二审调取的值房摘录', round: 2, person: '韩琪、陈世美', supports: '韩琪隶属驸马府，案发当日领命后携刀离府的时间。', limits: '出入记录没有写明命令内容，不能自行推出追杀授意。', original: true },
  register: { name: '招亲申报副本', glyph: '册', source: '第三审按婚史调查线索核对的申报文书', round: 3, person: '陈世美', supports: '陈世美申报未娶，须与均州核验及本人解释相互核对。', limits: '文书核实的是婚史申报，不是追杀命令。', original: true },
  witness: { name: '值房门吏证言', glyph: '证', source: '沿第二审线索传查当值门吏并复核', round: 3, person: '陈世美、韩琪', supports: '门吏称隔屏听见陈命韩追上秦氏母子，且说“一个也不许留”；须核对位置、时刻与供词。', limits: '单一听闻可能有误，必须与出入簿、时间线及质询相互核对。', original: true },
  contradiction: { name: '驸马质证笔录', glyph: '驳', source: '将值房证言与出入簿当堂交叉质询', round: 3, person: '陈世美', supports: '记录陈对韩琪行踪的前后矛盾，以及“不过命他赶走她们”的改口。', limits: '改口本身不是杀人自白，仍须结合已经复核的证言与勘验。', original: true },
}
export const claims = [
  { id: 'marriage', name: '原配婚姻', subtitle: '秦陈二人是否早有婚姻', needs: ['statement', 'token', 'marriage'], relation: 'marriage' },
  { id: 'conceal', name: '隐瞒婚史', subtitle: '入京招亲时是否隐瞒妻室', needs: ['marriage', 'register'], relation: 'conceal' },
  { id: 'attack', name: '持刀追逐', subtitle: '韩琪是否追逐威胁母子', needs: ['statement', 'knife', 'scene'], relation: 'attack' },
  { id: 'order', name: '授意追杀', subtitle: '指令能否追溯至陈世美', needs: ['roster', 'witness', 'contradiction'], relation: 'order' },
]
export const relations = {
  marriage: { pair: ['token', 'marriage'], name: '旧信物 ↔ 均州回文', fact: '原配婚姻', success: '乡里核验与信物来历吻合，婚姻关系得到交叉核实。' },
  conceal: { pair: ['marriage', 'register'], name: '均州回文 ↔ 招亲申报', fact: '隐瞒婚史', success: '婚姻在先，申报“未娶”在后；两份材料构成婚史隐瞒的矛盾。' },
  attack: { pair: ['knife', 'scene'], name: '韩琪遗刀 ↔ 三官堂勘验', fact: '持刀追逐', success: '刀具、现场与母子陈述相互印证。追逐行为可核实，指令仍待查。' },
  order: { pair: ['roster', 'witness'], name: '出入簿 ↔ 门吏证言', fact: '授意追杀', success: '时间、门吏当值位置及指令内容相互对应；还须当庭质询陈世美的解释。' },
}
