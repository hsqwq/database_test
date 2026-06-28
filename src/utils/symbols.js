export const SYMBOL_GROUPS = [
  {
    label: '选择/投影',
    symbols: [
      { char: 'σ', name: 'sigma (选择)', tip: 'σ 选择' },
      { char: 'π', name: 'pi (投影)', tip: 'π 投影' },
    ],
  },
  {
    label: '连接',
    symbols: [
      { char: '⋈', name: '自然连接', tip: '⋈ 自然连接' },
      { char: '⟕', name: '左外连接', tip: '⟕ 左外连接' },
      { char: '⟖', name: '右外连接', tip: '⟖ 右外连接' },
      { char: '⟗', name: '全外连接', tip: '⟗ 全外连接' },
      { char: '×', name: '笛卡尔积', tip: '× 笛卡尔积' },
    ],
  },
  {
    label: '集合运算',
    symbols: [
      { char: '∪', name: '并集', tip: '∪ 并集' },
      { char: '∩', name: '交集', tip: '∩ 交集' },
      { char: '−', name: '差集', tip: '− 差集' },
      { char: '÷', name: '除法', tip: '÷ 除法' },
    ],
  },
  {
    label: '重命名/聚合',
    symbols: [
      { char: 'ρ', name: 'rho (重命名)', tip: 'ρ 重命名' },
      { char: 'γ', name: 'gamma (分组)', tip: 'γ 分组/聚合' },
      { char: '←', name: '赋值', tip: '← 赋值' },
    ],
  },
  {
    label: '逻辑符号',
    symbols: [
      { char: '∧', name: '与', tip: '∧ 与' },
      { char: '∨', name: '或', tip: '∨ 或' },
      { char: '¬', name: '非', tip: '¬ 非' },
      { char: '∀', name: '全称量词', tip: '∀ 全称' },
      { char: '∃', name: '存在量词', tip: '∃ 存在' },
    ],
  },
  {
    label: '比较/集合',
    symbols: [
      { char: '≠', name: '不等于', tip: '≠ 不等于' },
      { char: '≤', name: '小于等于', tip: '≤ 小于等于' },
      { char: '≥', name: '大于等于', tip: '≥ 大于等于' },
      { char: '⊆', name: '子集', tip: '⊆ 子集' },
      { char: '∈', name: '属于', tip: '∈ 属于' },
    ],
  },
];
