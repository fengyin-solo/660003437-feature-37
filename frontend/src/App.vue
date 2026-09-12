<template>
  <div class="min-h-screen bg-slate-900 text-slate-200">
    <header class="border-b border-slate-700 px-6 py-4">
      <h1 class="text-2xl font-bold text-cyan-400">语言词源图谱与多语系演化追踪</h1>
      <p class="text-sm text-slate-500 mt-1">D3.js力导向图 · 印欧语系演化 · 同源词对照 · 500+词根</p>
    </header>
    <div class="p-4 space-y-4">
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-400">词源力导向网络</h3>
            <div class="flex items-center gap-3">
              <span v-if="store.selectedRootIndex !== null" class="text-xs text-cyan-400 flex items-center gap-1">
                已锁定词族
                <button class="underline hover:text-cyan-300" @click="store.selectRoot(null)">清除</button>
              </span>
              <span class="flex gap-3 text-xs">
                <span v-for="f in LANGUAGE_FAMILIES" :key="f.id" class="flex items-center gap-1">
                  <span class="w-3 h-3 rounded-full" :style="{backgroundColor: f.color}"></span>{{ f.name }}
                </span>
              </span>
            </div>
          </div>
          <svg ref="svgRef" class="w-full bg-slate-900 rounded" style="height:460px"></svg>
        </div>
        <div class="space-y-4">
          <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 class="text-sm font-bold text-slate-400 mb-3">语系概览</h3>
            <div class="space-y-2">
              <div v-for="f in LANGUAGE_FAMILIES" :key="f.id" class="flex items-start gap-2 text-sm">
                <span class="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" :style="{backgroundColor: f.color}"></span>
                <div><div class="font-bold">{{ f.name }}</div><div class="text-xs text-slate-500">{{ f.era }} · {{ f.languages.join('/') }}</div></div>
              </div>
            </div>
          </div>
          <div v-if="store.selectedNode" class="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 class="text-sm font-bold text-slate-400 mb-2 flex justify-between items-center">
              选中节点
              <button class="text-xs text-slate-500 hover:text-slate-300" @click="store.selectRoot(null)">✕</button>
            </h3>
            <div class="text-lg font-bold text-cyan-400">{{ store.selectedNode.word }}</div>
            <div class="text-sm text-slate-400">{{ store.selectedNode.language }} — {{ store.selectedNode.meaning }}</div>
          </div>
          <div class="bg-slate-800 rounded-lg p-4 border border-slate-700 text-xs text-slate-400">
            <h3 class="text-sm font-bold text-slate-400 mb-2">Grimm定律</h3>
            <div class="space-y-1">
              <div class="bg-slate-900 rounded p-2"><span class="text-cyan-400">p→f: </span>pater → father</div>
              <div class="bg-slate-900 rounded p-2"><span class="text-green-400">t→θ: </span>tres → three</div>
              <div class="bg-slate-900 rounded p-2"><span class="text-orange-400">k→h: </span>cord → heart</div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-sm font-bold text-slate-400 mb-3">同源词对照表</h3>
        <div class="flex gap-2 mb-3">
          <input v-model="store.searchQuery" placeholder="搜索词根/含义..." class="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500" />
          <select v-model="store.selectedFamily" class="bg-slate-900 border border-slate-600 rounded px-2 text-sm text-slate-300">
            <option value="all">全部语系</option>
            <option v-for="f in LANGUAGE_FAMILIES" :key="f.id" :value="f.id">{{ f.name }}</option>
          </select>
        </div>
        <div ref="tableScrollRef" class="overflow-x-auto max-h-64 overflow-y-auto">
          <table class="w-full text-xs">
            <thead class="sticky top-0 bg-slate-700">
              <tr>
                <th class="px-2 py-2 text-left text-slate-300">词根</th>
                <th class="px-2 py-2 text-left text-slate-300">含义</th>
                <th class="px-2 py-2 text-left text-cyan-400">英语</th>
                <th class="px-2 py-2 text-left text-blue-400">法语</th>
                <th class="px-2 py-2 text-left text-green-400">德语</th>
                <th class="px-2 py-2 text-left text-orange-400">西班牙语</th>
                <th class="px-2 py-2 text-left text-purple-400">俄语</th>
                <th class="px-2 py-2 text-left text-yellow-400">拉丁语</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cs in store.filteredCognates" :key="cs.root"
                  class="border-t border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                  :class="isRootSelected(cs) ? 'bg-cyan-900/40' : ''"
                  @click="toggleRoot(cs)">
                <td class="px-2 py-1.5 font-mono text-slate-200 font-bold">{{ cs.root }}</td>
                <td class="px-2 py-1.5 text-slate-400">{{ cs.meaning }}</td>
                <td class="px-2 py-1.5 font-mono text-cyan-300">{{ cs.languages['英语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-blue-300">{{ cs.languages['法语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-green-300">{{ cs.languages['德语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-orange-300">{{ cs.languages['西班牙语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-purple-300">{{ cs.languages['俄语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-yellow-300">{{ cs.languages['拉丁语'] || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import * as d3 from 'd3'
import { useEtymologyStore, LANGUAGE_FAMILIES, COGNATE_SETS } from './store/etymology'

const store = useEtymologyStore()
const svgRef = ref<SVGSVGElement | null>(null)
const tableScrollRef = ref<HTMLElement | null>(null)
const COLORS: Record<string, string> = { ie: '#3b82f6', st: '#22c55e', aa: '#f59e0b', ural: '#8b5cf6' }

// 图谱对象在首次绘制后持续复用；筛选只改视觉属性，不重绘、不重启模拟，
// 因而节点的力导向位置与用户的缩放/平移状态得以保留。
let nodeSel: d3.Selection<SVGGElement, any, SVGGElement, unknown> | null = null
let linkSel: d3.Selection<SVGLineElement, any, SVGGElement, unknown> | null = null

function drawGraph() {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  const W = svgRef.value.getBoundingClientRect().width || 700, H = 460
  const nodes = store.graph.nodes.map((n: any) => ({ ...n }))
  const links = store.graph.links.map((l: any) => ({ ...l }))
  const sim = d3.forceSimulation(nodes as any)
    .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(55))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(22))
  const g = svg.append('g')

  // 背景层：点击空白处清除筛选（拖动画布平移后松手不算点击）
  let panMoved = false
  svg.append('rect')
    .attr('width', W).attr('height', H).attr('fill', 'transparent')
    .on('mousedown', (event: MouseEvent) => {
      panMoved = false
      const sx = event.clientX, sy = event.clientY
      const onMove = (ev: MouseEvent) => {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 4) panMoved = true
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    })
    .on('click', () => { if (!panMoved) store.selectRoot(null) })

  svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 3]).on('zoom', (e) => g.attr('transform', e.transform)) as any)
  linkSel = g.append('g').selectAll('line').data(links).join('line')
    .attr('stroke', '#475569').attr('stroke-width', 1).attr('opacity', 0.5)
  let nodeMoved = false
  nodeSel = g.append('g').selectAll('g').data(nodes).join('g')
    .call(d3.drag<any, any>()
      .on('start', (e, d: any) => { nodeMoved = false; if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
      .on('drag', (e, d: any) => { nodeMoved = true; d.fx = e.x; d.fy = e.y })
      .on('end', (e, d: any) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null }))
    .on('click', (_: any, d: any) => {
      if (nodeMoved) return // 拖拽节点后的松手不算点击
      // 图谱点选 → 同步为表格筛选（再次点同一词族则取消）
      if (store.selectedRootIndex === d.rootIndex) store.selectRoot(null)
      else store.selectRoot(d.rootIndex)
    })
  nodeSel.append('circle')
    .attr('r', (d: any) => d.language === 'Proto-IE' ? 12 : 7)
    .attr('fill', (d: any) => COLORS[d.family] || '#64748b')
    .attr('stroke', '#1e293b').attr('stroke-width', 1.5)
  nodeSel.append('text').attr('dy', -14).attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', '#e2e8f0')
    .text((d: any) => d.word.length > 8 ? d.word.slice(0, 8) + '…' : d.word)
  nodeSel.append('title').text((d: any) => `${d.word} (${d.language}): ${d.meaning}`)
  sim.on('tick', () => {
    if (!linkSel || !nodeSel) return
    linkSel.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
    nodeSel.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })
  applyGraphVisual()
}

// 根据筛选状态更新图谱外观：命中词族正常显示，其余淡出；锁定词族高亮描边。
function applyGraphVisual() {
  if (!nodeSel || !linkSel) return
  const visible = store.visibleRootIndexes
  const selected = store.selectedRootIndex
  nodeSel.style('opacity', (d: any) => visible.has(d.rootIndex) ? 1 : 0.12)
    .style('pointer-events', (d: any) => visible.has(d.rootIndex) ? 'auto' : 'none')
  nodeSel.select('circle')
    .attr('stroke', (d: any) => d.rootIndex === selected ? '#22d3ee' : '#1e293b')
    .attr('stroke-width', (d: any) => d.rootIndex === selected ? (d.language === 'Proto-IE' ? 3 : 2) : 1.5)
  linkSel
    .attr('opacity', (d: any) => d.rootIndex === selected ? 0.95 : visible.has(d.rootIndex) ? 0.5 : 0.05)
    .attr('stroke', (d: any) => d.rootIndex === selected ? '#22d3ee' : '#475569')
}

function isRootSelected(cs: typeof COGNATE_SETS[number]) {
  return store.selectedRootIndex !== null && COGNATE_SETS.indexOf(cs) === store.selectedRootIndex
}

// 表格行点击 → 同步高亮图谱对应词族（再点一次取消）
function toggleRoot(cs: typeof COGNATE_SETS[number]) {
  const idx = COGNATE_SETS.indexOf(cs)
  store.selectRoot(store.selectedRootIndex === idx ? null : idx)
}

// 联动后保留表格当前滚动位置
function preserveTableScroll(cb: () => void) {
  const top = tableScrollRef.value?.scrollTop ?? 0
  cb()
  nextTick(() => { if (tableScrollRef.value) tableScrollRef.value.scrollTop = top })
}

// 可见性签名：避免直接 watch 每次新建的 Set 引用
const graphVisualKey = computed(() =>
  store.selectedRootIndex + '|' + [...store.visibleRootIndexes].sort((a, b) => a - b).join(',')
)

watch(() => store.searchQuery, () => preserveTableScroll(() => store.selectRoot(null)))
watch(() => store.selectedFamily, () => preserveTableScroll(() => store.selectRoot(null)))
watch(graphVisualKey, applyGraphVisual)

onMounted(() => { setTimeout(drawGraph, 100) })
</script>
