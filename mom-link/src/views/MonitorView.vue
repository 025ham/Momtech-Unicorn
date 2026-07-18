<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const scrollContainer = ref(null)

const goBack = () => {
  router.push('/')
}

// Mock Data naja
const heartRate = ref(145)
const movementCurrent = ref(18)
const movementTarget = ref(20)
const temperature = ref(36.8)
const stressLevel = ref('Low')

const timelineEvents = ref([
  { time: '17:00', type: 'pink', active: false },
  { time: '17:30', type: 'blue', active: true },
  { time: '18:20', type: 'pink', active: false }
])


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
        <div class="mock-graph">
          <div class="grid-lines"></div>
          <div class="mock-line"> *Heart Rate Graph Trace*</div>
        </div>
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
      <button class="nav-item">
        <span class="nav-icon">😊</span>
        <span class="nav-label">AI Analysis</span>
      </button>
      <button class="nav-item">
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
  width: 385px;
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
.value { font-size: 14px; }
.icon-red { color: #d9534f; }
.graph-placeholder {
  background: #fff8f8;
  border: 1px solid #fcdcdb;
  border-radius: 12px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d9534f;
  font-size: 12px;
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