<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/health'

const router = useRouter()
const healthStore = useHealthStore()

onMounted(() => {
  healthStore.fetchLogs(100)
})

const goBack = () => {
  router.push('/')
}

// Time filter
const activeFilter = ref('today')
const filters = ['today', 'week', 'month']

// Real data from store
const heartRateData = computed(() => healthStore.logs.map(l => l.heart_rate).filter(Boolean))
const movementData = computed(() => healthStore.logs.map(l => l.baby_movement).filter(Boolean))
const temperatureData = computed(() => healthStore.logs.map(l => l.temperature).filter(Boolean))

const maxHR = 180
const minHR = 60
const maxMov = 20
const maxTemp = 40
const minTemp = 35

const graphHeight = 80
const graphPadding = 5

// Generate SVG path for a line
const makeLinePath = (data, max, min) => {
  if (!data.length) return ''
  const width = 280
  const stepX = (width - graphPadding * 2) / (data.length - 1)
  let d = `M ${graphPadding} ${graphHeight - graphPadding - ((data[0] - min) / (max - min)) * (graphHeight - graphPadding * 2)}`
  for (let i = 1; i < data.length; i++) {
    const x = graphPadding + i * stepX
    const y = graphHeight - graphPadding - ((data[i] - min) / (max - min)) * (graphHeight - graphPadding * 2)
    d += ` L ${x} ${y}`
  }
  return d
}

// Generate area path
const makeAreaPath = (data, max, min) => {
  if (!data.length) return ''
  const width = 280
  const stepX = (width - graphPadding * 2) / (data.length - 1)
  let d = `M ${graphPadding} ${graphHeight - graphPadding}`
  d += ` L ${graphPadding} ${graphHeight - graphPadding - ((data[0] - min) / (max - min)) * (graphHeight - graphPadding * 2)}`
  for (let i = 1; i < data.length; i++) {
    const x = graphPadding + i * stepX
    const y = graphHeight - graphPadding - ((data[i] - min) / (max - min)) * (graphHeight - graphPadding * 2)
    d += ` L ${x} ${y}`
  }
  d += ` L ${graphPadding + (data.length - 1) * stepX} ${graphHeight - graphPadding} Z`
  return d
}

const hrLinePath = computed(() => makeLinePath(heartRateData.value, maxHR, minHR))
const hrAreaPath = computed(() => makeAreaPath(heartRateData.value, maxHR, minHR))
const movLinePath = computed(() => makeLinePath(movementData.value, maxMov, 0))
const movAreaPath = computed(() => makeAreaPath(movementData.value, maxMov, 0))
const tempLinePath = computed(() => makeLinePath(temperatureData.value, maxTemp, minTemp))
const tempAreaPath = computed(() => makeAreaPath(temperatureData.value, maxTemp, minTemp))

const doctorReports = ref([
  { date: '2024-09-15', comment: 'All vitals look healthy. Continue current routine.', doctor: 'Dr. Maria Chen' },
  { date: '2024-09-01', comment: 'Baby growth is on track. No concerns.', doctor: 'Dr. Maria Chen' },
  { date: '2024-08-15', comment: 'Everything looks normal. See you in 4 weeks.', doctor: 'Dr. Maria Chen' },
])

const scrollContainer = ref(null)
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
    class="health-report-view"
    ref="scrollContainer"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseLeave"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <!-- Top Nav -->
    <header class="app-header">
      <button class="back-btn" @click="goBack">❮</button>
      <h1>Health Report</h1>
      <div style="width: 24px;"></div>
    </header>

    <!-- Time Filter -->
    <section class="filter-section">
      <button
        v-for="f in filters"
        :key="f"
        class="filter-btn"
        :class="{ active: activeFilter === f }"
        @click="activeFilter = f"
      >
        {{ f.charAt(0).toUpperCase() + f.slice(1) }}
      </button>
    </section>

    <!-- Heart Rate Chart -->
    <section class="card chart-card">
      <div class="chart-header">
        <span class="chart-title">❤️ Heart Rate</span>
        <span class="chart-unit">bpm</span>
      </div>
      <svg viewBox="0 0 280 80" class="chart-svg">
        <defs>
          <linearGradient id="hrGradR" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#d9534f" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#d9534f" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path :d="hrAreaPath" fill="url(#hrGradR)" />
        <path :d="hrLinePath" fill="none" stroke="#d9534f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </section>

    <!-- Baby Movement Chart -->
    <section class="card chart-card">
      <div class="chart-header">
        <span class="chart-title">👶 Baby Movement</span>
        <span class="chart-unit">times</span>
      </div>
      <svg viewBox="0 0 280 80" class="chart-svg">
        <defs>
          <linearGradient id="movGradR" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2b5c8f" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#2b5c8f" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path :d="movAreaPath" fill="url(#movGradR)" />
        <path :d="movLinePath" fill="none" stroke="#2b5c8f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </section>

    <!-- Temperature Chart -->
    <section class="card chart-card">
      <div class="chart-header">
        <span class="chart-title">🌡️ Temperature</span>
        <span class="chart-unit">°C</span>
      </div>
      <svg viewBox="0 0 280 80" class="chart-svg">
        <defs>
          <linearGradient id="tempGradR" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f4ad73" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#f4ad73" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path :d="tempAreaPath" fill="url(#tempGradR)" />
        <path :d="tempLinePath" fill="none" stroke="#e26d5c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </section>

    <!-- Doctor Reports -->
    <section class="card doctor-report-card">
      <h3>Doctor Comments</h3>
      <div class="report-list">
        <div v-for="(report, idx) in doctorReports" :key="idx" class="report-item">
          <div class="report-header">
            <span class="report-date">{{ report.date }}</span>
            <span class="report-doctor">{{ report.doctor }}</span>
          </div>
          <p class="report-comment">{{ report.comment }}</p>
        </div>
      </div>
      <div class="report-actions">
        <button class="report-btn btn-download">📥 Download PDF</button>
        <button class="report-btn btn-share">📤 Share to Doctor</button>
      </div>
    </section>

    <!-- Bottom Nav-->
    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item" @click="router.push('/monitor')">
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
.health-report-view {
  background-color: #fcf8f2;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 110px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: grab;
  user-select: none;
}
.health-report-view.active-drag { cursor: grabbing; }
.health-report-view::-webkit-scrollbar { display: none; }

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

/* Filter */
.filter-section {
  display: flex;
  gap: 10px;
}
.filter-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  cursor: pointer;
}
.filter-btn.active {
  background: #449284;
  color: white;
}

/* Card Base */
.card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.01);
}
.card h3 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

/* Charts */
.chart-card {}
.chart-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.chart-title {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}
.chart-unit {
  font-size: 11px;
  color: #888;
}
.chart-svg {
  width: 100%;
  height: 80px;
  overflow: visible;
}

/* Doctor Report */
.report-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.report-item {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 12px;
}
.report-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.report-date {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}
.report-doctor {
  font-size: 11px;
  color: #888;
}
.report-comment {
  font-size: 12px;
  color: #555;
  line-height: 1.5;
}
.report-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.report-btn {
  border: none;
  border-radius: 12px;
  padding: 10px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}
.btn-download { background: #d6e2f9; color: #2b5c8f; }
.btn-share { background: #d1ebd9; color: #2e6b5e; }

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
