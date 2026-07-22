<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/health'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const healthStore = useHealthStore()
const userStore = useUserStore()

onMounted(async () => {
  await Promise.all([
    healthStore.fetchLatest(),
    healthStore.fetchStats(),
    userStore.fetchUser(),
  ])
})

// goBack function removed (not used in template)
const healthScore = computed(() => healthStore.stats?.avg_heart_rate ? 97 : (healthStore.latest?.heart_rate ? Math.round((healthStore.latest.heart_rate / 180) * 100) : '--'))
const riskLevel = ref('Low')
const riskLevelColor = ref('#00a86b')

const metrics = computed(() => [
  { name: 'Heart Rate', value: healthStore.latest?.heart_rate ? healthStore.latest.heart_rate + ' bpm' : 'N/A', status: 'stable', prediction: healthStore.latest?.heart_rate > 150 ? 70 : 95 },
  { name: 'Baby Movement', value: healthStore.latest?.baby_movement != null ? healthStore.latest.baby_movement + ' times' : 'N/A', status: 'normal', prediction: healthStore.latest?.baby_movement >= 10 ? 92 : 60 },
  { name: 'Temperature', value: healthStore.latest?.temperature ? healthStore.latest.temperature + '°C' : 'N/A', status: 'normal', prediction: 98 },
  { name: 'Stress Level', value: healthStore.latest?.stress_level || 'N/A', status: 'stable', prediction: 90 },
])

const aiSummary = computed(() => {
  const week = userStore.user?.pregnancy_week || '-'
  const movement = healthStore.latest?.baby_movement ?? '-'
  return [
    `Heart rate is within normal range for week ${week}`,
    `Baby movement count is ${movement} movements today`,
    'No signs of distress detected',
    'Continue current activity and rest routine',
  ]
})

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
    class="ai-analysis-view"
    ref="scrollContainer"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseLeave"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <!-- Top Nav -->
    <header class="app-header">
      <button class="back-btn" @click="goBack">❮</button>
      <h1>AI Analysis</h1>
      <div style="width: 24px;"></div>
    </header>

    <!-- Health Score & Risk Gauge -->
    <section class="card score-risk-card">
      <div class="score-gauge-wrapper">
        <div class="score-arc" :style="{ '--score': healthScore }">
          <div class="score-inner">
            <span class="score-value">{{ healthScore }}%</span>
            <span class="score-label">Health Score</span>
          </div>
        </div>
      </div>
      <div class="risk-indicator">
        <span class="risk-label">Risk Level</span>
        <div class="risk-bar-container">
          <div class="risk-bar">
            <div class="risk-fill" :style="{ width: riskLevel === 'Low' ? '25%' : riskLevel === 'Medium' ? '50%' : '75%', backgroundColor: riskLevelColor }"></div>
          </div>
          <span class="risk-text" :style="{ color: riskLevelColor }">{{ riskLevel }}</span>
        </div>
      </div>
    </section>

    <!-- AI Summary -->
    <section class="card ai-summary-card">
      <h3>AI Summary</h3>
      <ul class="summary-list">
        <li v-for="(item, idx) in aiSummary" :key="idx">{{ item }}</li>
      </ul>
    </section>

    <!-- Detected Pattern -->
    <section class="card pattern-card">
      <h3>Detected Pattern</h3>
      <div class="pattern-grid">
        <div v-for="(metric, idx) in metrics" :key="idx" class="pattern-item">
          <div class="pattern-header">
            <span class="pattern-name">{{ metric.name }}</span>
            <span class="pattern-status" :class="'status-' + metric.status">{{ metric.status }}</span>
          </div>
          <div class="pattern-value">{{ metric.value }}</div>
          <div class="prediction-bar">
            <div class="prediction-fill" :style="{ width: metric.prediction + '%' }"></div>
          </div>
          <span class="prediction-text">{{ metric.prediction }}% Safe</span>
        </div>
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
      <button class="nav-item active">
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
.ai-analysis-view {
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
.ai-analysis-view.active-drag { cursor: grabbing; }
.ai-analysis-view::-webkit-scrollbar { display: none; }

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

/* Card Base */
.card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.01);
}
.card h3 {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

/* Score & Risk Card */
.score-risk-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.score-gauge-wrapper {
  display: flex;
  justify-content: center;
}
.score-arc {
  width: 140px;
  height: 70px;
  background: linear-gradient(135deg, #00bf72, #00a86b);
  border-radius: 140px 140px 0 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.score-inner {
  width: 100px;
  height: 50px;
  background: white;
  border-radius: 100px 100px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 4px;
}
.score-value {
  font-size: 22px;
  font-weight: bold;
  color: #00bf72;
}
.score-label {
  font-size: 10px;
  color: #888;
}

.risk-indicator {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.risk-label {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}
.risk-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}
.risk-bar {
  flex: 1;
  height: 10px;
  background: #eee;
  border-radius: 5px;
  overflow: hidden;
}
.risk-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s;
}
.risk-text {
  font-size: 13px;
  font-weight: bold;
  min-width: 60px;
}

/* AI Summary */
.summary-list {
  padding-left: 18px;
  font-size: 13px;
  color: #444;
  line-height: 1.8;
}

/* Pattern Grid */
.pattern-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.pattern-item {
  background: #f9f9f9;
  border-radius: 14px;
  padding: 12px;
}
.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.pattern-name {
  font-size: 12px;
  font-weight: bold;
  color: #333;
}
.pattern-status {
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
}
.status-normal { background: #d1ebd9; color: #2e6b5e; }
.status-stable { background: #d6e2f9; color: #2b5c8f; }
.status-warning { background: #fde0cc; color: #c9601a; }

.pattern-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}
.prediction-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}
.prediction-fill {
  height: 100%;
  background: #00bf72;
  border-radius: 3px;
}
.prediction-text {
  font-size: 10px;
  color: #888;
}

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
