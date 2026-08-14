<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/health'
import { useUserStore } from '@/stores/user'
import IconBack from '@/components/icons/IconBack.vue'

const router = useRouter()
const healthStore = useHealthStore()
const userStore = useUserStore()

onMounted(async () => {
  // Don't fetchLatest - it would overwrite the simulation data from HomeView
  // Just fetch stats and user data
  await Promise.all([
    healthStore.fetchStats(),
    userStore.fetchUser(),
  ])
})

// Emergency thresholds
const EMERGENCY_HR = 170
const EMERGENCY_TEMP = 38.0
const EMERGENCY_MOVEMENT = 2

// Compute risk level and status based on health data
const computedRisk = computed(() => {
  const hr = healthStore.latest?.heart_rate || 0
  const temp = healthStore.latest?.temperature || 0
  const movement = healthStore.latest?.baby_movement ?? 10

  // Emergency check
  if (hr > EMERGENCY_HR || temp > EMERGENCY_TEMP || movement <= EMERGENCY_MOVEMENT) {
    return { level: 'High', color: '#d9534f' }
  }
  // Warning check
  if (hr > 150 || temp > 37.5 || movement < 5) {
    return { level: 'Medium', color: '#e26d5c' }
  }
  // Normal
  return { level: 'Low', color: '#00a86b' }
})

const riskLevel = computed(() => computedRisk.value.level)
const riskLevelColor = computed(() => computedRisk.value.color)

// Score color based on risk level
const scoreColor = computed(() => {
  if (riskLevel.value === 'High') return '#d9534f' // red
  if (riskLevel.value === 'Medium') return '#e26d5c' // orange
  return '#00bf72' // green
})

// Helper to determine status
const getStatus = (type, value) => {
  if (type === 'heart_rate') {
    if (value > EMERGENCY_HR) return 'warning'
    if (value > 150) return 'warning'
    return 'stable'
  }
  if (type === 'movement') {
    if (value <= EMERGENCY_MOVEMENT) return 'warning'
    if (value < 5) return 'warning'
    return 'normal'
  }
  if (type === 'temperature') {
    if (value > EMERGENCY_TEMP) return 'warning'
    if (value > 37.5) return 'warning'
    return 'normal'
  }
  if (type === 'stress') {
    if (value === 'High') return 'warning'
    if (value === 'Medium') return 'stable'
    return 'normal'
  }
  return 'normal'
}

const metrics = computed(() => [
  {
    name: 'Heart Rate',
    value: healthStore.latest?.heart_rate ? healthStore.latest.heart_rate + ' bpm' : 'N/A',
    status: getStatus('heart_rate', healthStore.latest?.heart_rate),
    prediction: healthStore.latest?.heart_rate > EMERGENCY_HR ? 30 : (healthStore.latest?.heart_rate > 150 ? 60 : 95)
  },
  {
    name: 'Baby Movement',
    value: healthStore.latest?.baby_movement != null ? healthStore.latest.baby_movement + ' times' : 'N/A',
    status: getStatus('movement', healthStore.latest?.baby_movement),
    prediction: healthStore.latest?.baby_movement <= EMERGENCY_MOVEMENT ? 20 : (healthStore.latest?.baby_movement < 5 ? 50 : 92)
  },
  {
    name: 'Temperature',
    value: healthStore.latest?.temperature ? healthStore.latest.temperature + '°C' : 'N/A',
    status: getStatus('temperature', healthStore.latest?.temperature),
    prediction: healthStore.latest?.temperature > EMERGENCY_TEMP ? 25 : (healthStore.latest?.temperature > 37.5 ? 65 : 98)
  },
  {
    name: 'Stress Level',
    value: healthStore.latest?.stress_level || 'N/A',
    status: getStatus('stress', healthStore.latest?.stress_level),
    prediction: healthStore.latest?.stress_level === 'High' ? 25 : (healthStore.latest?.stress_level === 'Medium' ? 70 : 90)
  },
])

const aiSummary = computed(() => {
  const week = userStore.user?.pregnancy_week || '-'
  const hr = healthStore.latest?.heart_rate || 0
  const temp = healthStore.latest?.temperature || 0
  const movement = healthStore.latest?.baby_movement ?? 0
  const stress = healthStore.latest?.stress_level || 'Normal'

  const summary = []

  // Heart rate summary
  if (hr > EMERGENCY_HR) {
    summary.push(`⚠️ Heart rate is dangerously high (${hr} bpm) - Immediate attention needed`)
  } else if (hr > 150) {
    summary.push(`Heart rate is elevated (${hr} bpm) - Monitor closely`)
  } else {
    summary.push(`Heart rate is within normal range for week ${week}`)
  }

  // Movement summary
  if (movement <= EMERGENCY_MOVEMENT) {
    summary.push(`⚠️ Baby movement is very low (${movement}) - Contact doctor immediately`)
  } else if (movement < 5) {
    summary.push(`Baby movement count is low (${movement} movements today)`)
  } else {
    summary.push(`Baby movement count is ${movement} movements today`)
  }

  // Temperature summary
  if (temp > EMERGENCY_TEMP) {
    summary.push(`⚠️ Temperature is elevated (${temp}°C) - Possible fever`)
  } else if (temp > 37.5) {
    summary.push(`Temperature is slightly elevated (${temp}°C)`)
  }

  // Stress summary
  if (stress === 'High') {
    summary.push(`⚠️ Stress level is HIGH - Please rest and relax`)
  } else {
    summary.push('No signs of distress detected')
  }

  return summary
})

// Health Score computation - same as HomeView
const healthScore = computed(() => {
  const latest = healthStore.latest
  if (!latest || latest.heart_rate == null) return 0

  const hr = latest.heart_rate || 0
  const temp = latest.temperature || 36.5
  const movement = latest.baby_movement ?? 10
  const stress = latest.stress_level || 'Normal'

  // Emergency thresholds
  if (hr > EMERGENCY_HR || hr < 50 || temp > EMERGENCY_TEMP || temp < 35.5 || movement <= EMERGENCY_MOVEMENT || stress === 'High') {
    return Math.floor(Math.random() * 20 + 15)
  }

  let score = 100

  if (hr > EMERGENCY_HR) score -= (hr - EMERGENCY_HR) * 3
  if (hr < 60) score -= (60 - hr) * 2
  if (temp > 37.5) score -= (temp - 37.5) * 15
  if (temp < 36.0) score -= (36.0 - temp) * 15
  if (movement < 3) score -= (3 - movement) * 8
  if (movement < 5) score -= (5 - movement) * 2
  if (stress === 'High') score -= 25
  else if (stress === 'Medium') score -= 10

  return Math.max(15, Math.min(100, Math.floor(score)))
})
</script>

<template>
  <div class="ai-analysis-view">
    <!-- Top Nav -->
    <header class="app-header">
      <button class="back-btn" @click="router.push('/home')"><IconBack :size="18" /></button>
      <h1>AI Analysis</h1>
      <div style="width: 24px;"></div>
    </header>

    <!-- Health Score & Risk Gauge -->
    <section class="card score-risk-card">
      <div class="score-gauge-wrapper">
        <div class="score-arc" :style="{ '--score': healthScore, background: `linear-gradient(135deg, ${scoreColor}, ${scoreColor})` }">
          <div class="score-inner">
            <span class="score-value" :style="{ color: scoreColor }">{{ healthScore }}%</span>
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
  </div>
</template>

<style scoped>
.ai-analysis-view {
  background-color: #fcf8f2;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  padding-top: 80px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.app-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #d1ebd9;
  padding: 16px;
  z-index: 10;
  box-sizing: border-box;
}
.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  color: #333;
}
.app-header h1 {
  font-size: 16px;
  font-weight: 600;
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
  font-weight: 600;
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
  font-weight: 600;
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
  font-weight: 600;
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
  font-weight: 600;
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
  font-weight: 600;
  color: #333;
}
.pattern-status {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}
.status-normal { background: #d1ebd9; color: #2e6b5e; }
.status-stable { background: #d6e2f9; color: #2b5c8f; }
.status-warning { background: #fde0cc; color: #c9601a; }

.pattern-value {
  font-size: 16px;
  font-weight: 600;
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
</style>
