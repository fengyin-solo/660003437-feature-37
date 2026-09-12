import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { COGNATE_SETS, LANGUAGE_FAMILIES, buildGraph } from '../mock/data'
export { LANGUAGE_FAMILIES, COGNATE_SETS }

export const useEtymologyStore = defineStore('etymology', () => {
  const graph = ref(buildGraph())
  const selectedNode = ref<any>(null)
  const searchQuery = ref('')
  const selectedFamily = ref('all')
  // 在图谱中点选的词族索引（null 表示未做图谱筛选）
  const selectedRootIndex = ref<number | null>(null)

  const matchesQuery = (cs: typeof COGNATE_SETS[number]) => {
    const q = searchQuery.value.toLowerCase()
    return !q || cs.root.toLowerCase().includes(q) || cs.meaning.includes(q) || Object.values(cs.languages).some((w: string) => w.toLowerCase().includes(q))
  }
  const matchesFamily = (cs: typeof COGNATE_SETS[number]) =>
    selectedFamily.value === 'all' || cs.family === selectedFamily.value

  // 仅由表格的搜索框 / 语系下拉决定 —— 图谱同步依据
  const graphFilteredCognates = computed(() =>
    COGNATE_SETS.filter(cs => matchesQuery(cs) && matchesFamily(cs))
  )

  // 表格实际展示的集合：图谱点选了词族时钉选该行，否则按搜索/语系过滤
  const filteredCognates = computed(() => {
    if (selectedRootIndex.value !== null) return [COGNATE_SETS[selectedRootIndex.value]]
    return graphFilteredCognates.value
  })

  // 图谱当前可见的词族原始索引集合（搜索/语系命中 + 点选钉住的词族）
  const visibleRootIndexes = computed(() => {
    const set = new Set(graphFilteredCognates.value.map(cs => COGNATE_SETS.indexOf(cs)))
    if (selectedRootIndex.value !== null) set.add(selectedRootIndex.value)
    return set
  })

  function selectRoot(index: number | null) {
    selectedRootIndex.value = index
    if (index === null) {
      selectedNode.value = null
    } else {
      selectedNode.value = graph.value.nodes.find((n: any) => n.id === 'root_' + index) ?? null
    }
  }

  return { graph, selectedNode, searchQuery, selectedFamily, selectedRootIndex, graphFilteredCognates, filteredCognates, visibleRootIndexes, selectRoot }
})
