<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/health'

const router = useRouter()
const healthStore = useHealthStore()
const scrollContainer = ref(null)

const goBack = () => {
  router.push('/')
}

// Mock Data
const heartRate = computed(() => healthStore.metrics.heartRate)
const movementCurrent = computed(() => healthStore.metrics.babyMovement)
const movementTarget = computed(() => healthStore.metrics.movementTarget)
const temperature = computed(() => healthStore.metrics.temperature)
const stressLevel = computed(() => healthStore.metrics.stressLevel)

const timelineEvents = ref([
  { time: '17:00', type: 'pink', active: false },
  { time: '17:30', type: 'blue', active: true },
  { time: '18:20', type: 'pink', active: false }
])

// Heart Rate Graph Data - simulated real-time
const heartRateData = computed(() => healthStore.metrics.heartRateHistory)
const maxHR = 180
const minHR = 60
const graphPoints = computed(() => {
  const width = 300
  const height = 120
  const padding = 10
  const data = heartRateData.value
  const stepX = (width - padding * 2) / (data.length - 1)

  return data.map((val, i) => {
    const x = padding + i * stepX
    const y = height - padding - ((val - minHR) / (maxHR - minHR)) * (height - padding * 2)
    return { x, y, val }
  })
})

// Generate smooth SVG path
const linePath = computed(() => {
  const pts = graphPoints.value
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` Q ${cpx} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`
    d += ` Q ${cpx} ${curr.y} ${curr.x} ${curr.y}`
  }
  return d
})

// Area fill path
const areaPath = computed(() => {
  const pts = graphPoints.value
  if (pts.length < 2) return ''
  const height = 120
  const padding = 10
  let d = `M ${pts[0].x} ${height - padding}`
  d += ` L ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` Q ${cpx} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`
    d += ` Q ${cpx} ${curr.y} ${curr.x} ${curr.y}`
  }
  d += ` L ${pts[pts.length - 1].x} ${height - padding} Z`
  return d
})

// Simulate real-time heart rate update
let intervalId = null
const currentHR = ref(145)
onMounted(() => {
  intervalId = setInterval(() => {
    // Simulate small fluctuations
    const baseHR = 140 + Math.floor(Math.random() * 15) - 7
    currentHR.value = baseHR
    // Update store
    healthStore.addHeartRateReading(baseHR)
  }, 2000)
})
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})


let isDown = false
let startY, scrollTop

const handleMouseDown = (e) => {
  isDown = true
  scrollContainer.value.classList.add('active-drag')
  startY = e.pageY - scrollContainer.value.offsetTop
  scrollTop = scrollContainer.value.scrollTop
}
const handleMouseLeave = () => { isDown = false; scrollContainer.value.classList.remove('active-drag') }
const handleMouseUp = () => { isDown = false; scrollContainer.value.classList.remove('active-drag') }
const handleMouseMove = (e) => {
  if (!isDown) return
  e.preventDefault()
  const y = e.pageY - scrollContainer.value.offsetTop
  const walk = (y - startY) * 1.5
  scrollContainer.value.scrollTop = scrollTop - walk
}
</script>

<template>
  <div 
    class="monitor-view"
    ref="scrollContainer"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseLeave"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <!-- Top Nav -->
    <header class="app-header">
      <button class="back-btn" @click="goBack">❮</button>
      <h1>Live Monitoring</h1>
      <div style="width: 24px;"></div> <!-- รักษาสมดุลกึ่งกลาง -->
    </header>

    <!-- Heart Rate -->
    <section class="card heart-rate-card">
      <div class="card-header">
        <span class="title">Heart Rate</span>
        <span class="value"><span class="icon-red">❤️</span> {{ heartRate }} <small>bpm</small></span>
      </div>

      <div class="graph-placeholder">
        <svg viewBox="0 0 300 120" class="hr-graph" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hrGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#d9534f" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#d9534f" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line x1="10" y1="20" x2="290" y2="20" class="grid-line" />
          <line x1="10" y1="40" x2="290" y2="40" class="grid-line" />
          <line x1="10" y1="60" x2="290" y2="60" class="grid-line" />
          <line x1="10" y1="80" x2="290" y2="80" class="grid-line" />
          <line x1="10" y1="100" x2="290" y2="100" class="grid-line" />

          <!-- Y-axis labels -->
          <text x="5" y="24" class="graph-label">180</text>
          <text x="5" y="44" class="graph-label">150</text>
          <text x="5" y="64" class="graph-label">120</text>
          <text x="5" y="84" class="graph-label">90</text>
          <text x="5" y="104" class="graph-label">60</text>

          <!-- Area fill -->
          <path :d="areaPath" class="graph-area" />

          <!-- Main line -->
          <path :d="linePath" class="graph-line" />

          <!-- Data points -->
          <circle
            v-for="(pt, i) in graphPoints"
            :key="i"
            :cx="pt.x"
            :cy="pt.y"
            r="3"
            class="data-dot"
          />

          <!-- Current value indicator -->
          <rect x="260" y="5" width="35" height="18" rx="8" class="current-badge-bg" />
          <text x="277" y="17" class="current-badge-text">{{ currentHR }}</text>
        </svg>
      </div>
    </section>

    <!-- Baby Movement -->
    <div class="dual-row">
      <div class="card movement-card">
        <h3>Baby Movement</h3>
        <div class="progress-container">
          <div class="circle-progress">
            <span class="progress-val">{{ movementCurrent }}/{{ movementTarget }}</span>
          </div>
        </div>
      </div>

      <div class="card timeline-card">
        <h3>Timeline</h3>
        <div class="timeline-list">
          <div v-for="(event, idx) in timelineEvents" :key="idx" class="timeline-item" :class="{ active: event.active }">
            <span class="time-txt">{{ event.time }}</span>
            <span class="indicator-dot"></span>
            <span class="feet-icon">{{ event.type === 'pink' ? '👣💖' : '👣💙' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Temperature & Stress -->
    <div class="dual-row">
      <div class="card gauge-card">
        <h3>Temperature</h3>
        <div class="semi-gauge bg-temp">
          <div class="gauge-inner">
            <span class="gauge-text">{{ temperature }}°C</span>
          </div>
        </div>
      </div>

      <!-- Stress Level  -->
      <div class="card gauge-card">
        <h3>Stress</h3>
        <div class="semi-gauge bg-stress">
          <div class="gauge-inner">
            <span class="gauge-text">{{ stressLevel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-row">
      <button class="action-btn btn-refresh"> Refresh</button>
      <button class="action-btn btn-export"> Export Data</button>
    </div>

    <!-- Bottom Nav-->
    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item active">
        <span class="nav-icon">📈</span>
        <span class="nav-label">Monitor</span>
      </button>
      <button class="nav-item" @click="router.push('/ai-analysis')">
        <span class="nav-icon">😊</span>
        <span class="nav-label">AI Analysis</span>
      </button>
      <button class="nav-item" @click="router.push('/profile')">
        <span class="nav-icon">👤</span>
        <span class="nav-label">Profile</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.monitor-view {
  background-color: #fcf8f2;
  width: 100%; /* ยืดเต็มกรอบ */
  height: 100%; /* ยืดเต็มกรอบ */
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 110px; /* เว้นระยะหลบ Bottom Nav */
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: grab;
  user-select: none;
}
.monitor-view.active-drag { cursor: grabbing; }
.monitor-view::-webkit-scrollbar { display: none; }

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #d1ebd9;
  padding: 16px;
  border-radius: 24px;
  margin: -16px -16px 0 -16px;
  position: sticky;
  top: -16px;
  z-index: 10;
  /* Stretch beyond container using negative margin + full width */
  width: calc(100% + 32px);
  box-sizing: border-box;
}
.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
}
.app-header h1 {
  font-size: 16px;
  font-weight: bold;
}

/* Card Base */
.card {
  background: white;
  border-radius: 20px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.01);
}
.card h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 8px;
}

/* Heart Rate Graph Section */
.card-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 10px;
}
.title { font-size: 13px; font-weight: bold; }
.value { font-size: 14px; }
.icon-red { color: #d9534f; }
.graph-placeholder {
  background: #fff8f8;
  border: 1px solid #fcdcdb;
  border-radius: 12px;
  height: 140px;
  overflow: hidden;
}

/* Heart Rate Graph */
.hr-graph {
  width: 100%;
  height: 100%;
}
.grid-line {
  stroke: #fcdcdb;
  stroke-width: 1;
}
.graph-label {
  font-size: 8px;
  fill: #aaa;
}
.graph-area {
  fill: url(#hrGradient);
  opacity: 0.4;
}
.graph-line {
  fill: none;
  stroke: #d9534f;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.data-dot {
  fill: #d9534f;
}
.current-badge-bg {
  fill: #d9534f;
}
.current-badge-text {
  font-size: 9px;
  fill: white;
  font-weight: bold;
  text-anchor: middle;
}

/* Layout Row */
.dual-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* Progress Circle */
.progress-container {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
.circle-progress {
  width: 90px;
  height: 90px;
  border: 8px solid #7ea4cc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.progress-val { font-weight: bold; font-size: 20px; color: #333; }

/* Timeline */
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
}
.timeline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}
.time-txt{font-size: 17px;}
.timeline-item.active { color: #2b5c8f; font-weight: bold; }
.indicator-dot {
  width: 8px;
  height: 8px;
  border: 2px solid #ccc;
  border-radius: 50%;
}
.timeline-item.active .indicator-dot {
  border-color: #2b5c8f;
  background-color: #2b5c8f;
}

/* Gauges */
.semi-gauge {
  width: 100px;
  height: 50px;
  border-radius: 100px 100px 0 0;
  margin: 10px auto 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.bg-temp { background: linear-gradient(90deg, #e26d5c, #f4ad73); }
.bg-stress { background: #a1cda8; }
.gauge-inner {
  width: 80px;
  height: 40px;
  background: white;
  border-radius: 85px 85px 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.gauge-text { font-size: 17px; font-weight: bold; margin-bottom: 2px; }

/* Action Buttons */
.action-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 4px;
}
.action-btn {
  border: none;
  border-radius: 14px;
  padding: 12px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
}
.btn-refresh { background-color: #fcdcdb; color: #333; }
.btn-export { background-color: #afe1d1; color: #1a302a; }

/* Bottom Nav */
.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 24px 0;
  border-top: 1px solid #f0eae1;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04); 
  z-index: 100;
}
.nav-item {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #888;
  cursor: pointer;
}
.nav-item.active { color: #449284; }
.nav-icon { font-size: 18px; }
.nav-label { font-size: 10px; font-weight: 500; }
</style>