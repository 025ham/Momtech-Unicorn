<script setup>
import { ref } from 'vue'

const deviceStatus = ref({
  connected: true,
  battery: 92,
  bluetooth: 'Strong',
})

const healthMetrics = ref({
  heartRate: 145,
  babyMovement: 18,
  temperature: 36.8,
  stress: 'Low',
  healthScore: 97,
})

// ตัวแปรและฟังก์ชันสำหรับระบบ Click & Drag to Scroll
const scrollContainer = ref(null)
let isDown = false
let startY
let scrollTop

const handleMouseDown = (e) => {
  isDown = true
  scrollContainer.value.classList.add('active-drag')
  startY = e.pageY - scrollContainer.value.offsetTop
  scrollTop = scrollContainer.value.scrollTop
}

const handleMouseLeave = () => {
  isDown = false
  scrollContainer.value.classList.remove('active-drag')
}

const handleMouseUp = () => {
  isDown = false
  scrollContainer.value.classList.remove('active-drag')
}

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
    class="home-view"
    ref="scrollContainer"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseLeave"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <header class="app-header">
      <div class="user-profile">
        <span class="avatar">👋</span>
        <div class="user-text">
          <h1>Good Morning, Mother</h1>
          <p class="sub-text">Week 28 Pregnancy</p>
        </div>
      </div>
      <div class="header-icons">
        <button class="icon-btn notification">🔔<span class="badge-dot"></span></button>
        <button class="icon-btn">⚙️</button>
      </div>
    </header>

    <section class="momentum-patch-card">
      <div class="card-title">Momentum Patch</div>
      <div class="patch-grid">
        <div class="patch-item border-right">
          <span class="p-icon">🌀</span>
          <div class="p-info">
            <span class="p-label">Device Status : </span>
            <span class="p-value status-active">Connected</span>
          </div>
        </div>
        <div class="patch-item border-right">
          <span class="p-icon">🔋</span>
          <div class="p-info">
            <span class="p-label">Battery :</span>
            <span class="p-value">{{ deviceStatus.battery }}%</span>
          </div>
        </div>
        <div class="patch-item">
          <span class="p-icon">📶</span>
          <div class="p-info">
            <span class="p-label">Bluetooth :</span>
            <span class="p-value status-active">{{ deviceStatus.bluetooth }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section-container">
      <h2 class="section-title">Today's Health</h2>
      <div class="metrics-grid">
        <div class="metric-card bg-red">
          <span class="m-icon">❤️</span>
          <div class="m-content">
            <span class="m-label">Heart Rate</span>
            <span class="m-value">
              {{ healthMetrics.heartRate }} <small>bpm</small> ,
              <span class="txt-green">Normal</span>
            </span>
          </div>
        </div>
        <div class="metric-card bg-blue">
          <span class="m-icon">👶</span>
          <div class="m-content">
            <span class="m-label">Baby Movement</span>
            <span class="m-value">{{ healthMetrics.babyMovement }} <small>Time/Today</small></span>
          </div>
        </div>
        <div class="metric-card bg-orange">
          <span class="m-icon">🌡️</span>
          <div class="m-content">
            <span class="m-label">Temperature</span>
            <span class="m-value">{{ healthMetrics.temperature }}°C</span>
          </div>
        </div>
        <div class="metric-card bg-green-light">
          <span class="m-icon">🙂</span>
          <div class="m-content">
            <span class="m-label">Stress</span>
            <span class="m-value txt-green">{{ healthMetrics.stress }}</span>
          </div>
        </div>
      </div>
    </section>

    <div class="dual-row">
      <div class="summary-card">
        <h3>Today's Summary</h3>
        <ul>
          <li>Everything looks normal.</li>
          <li>Baby movement is healthy.</li>
          <li>Heart rate is stable.</li>
          <li>No emergency signs.</li>
        </ul>
      </div>

      <div class="score-card">
        <h3>AI Health Score</h3>
        <div class="gauge-container">
          <div class="gauge-arc">
            <div class="gauge-inner">
              <span class="score-val">{{ healthMetrics.healthScore }}%</span>
            </div>
          </div>
          <span class="score-status">Excellent</span>
        </div>
      </div>
    </div>

    <section class="recommendation-card">
      <h3>AI Recommendation</h3>
      <div class="rec-grid">
        <div class="rec-item">• Drink more water</div>
        <div class="rec-item">• Walk 20 mins</div>
        <div class="rec-item">• Sleep 8 hours</div>
        <div class="rec-item">• Visit doctor next week</div>
      </div>
      <button class="view-more">View More</button>
    </section>

    <section class="section-container">
      <h2 class="section-title">Quick Action</h2>
      <div class="action-grid">
        <button class="act-btn btn-mint"><span class="act-icon">📈</span> Live Monitor</button>
        <button class="act-btn btn-purple"><span class="act-icon">😊</span> AI Analysis</button>
        <button class="act-btn btn-peach"><span class="act-icon">📄</span> Report</button>
        <button class="act-btn btn-rose text-danger">
          <span class="act-icon">⚠️</span> Emergency
        </button>
      </div>
    </section>

    <nav class="bottom-nav">
      <button class="nav-item active">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item">
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
/* CSS คงเดิมตามที่คุณเขียนไว้ได้เลยครับ... */
.home-view {
  background-color: #fcf8f2;
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  cursor: grab;
  user-select: none;
}
.home-view.active-drag {
  cursor: grabbing;
}
.home-view::-webkit-scrollbar {
  display: none;
}

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
  z-index: 10;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  font-size: 24px;
}
.user-text h1 {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a1a;
}
.sub-text {
  font-size: 12px;
  color: #555;
}
.header-icons {
  display: flex;
  gap: 8px;
}
.icon-btn {
  background: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.badge-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  background-color: red;
  border-radius: 50%;
}

/* Momentum Patch Card */
.momentum-patch-card {
  background-color: #b9ded2;
  border-radius: 20px;
  padding: 14px 0 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
.card-title {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  color: #1a302a;
  margin-bottom: 12px;
}
.patch-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: rgba(255, 255, 255, 0.4);
  padding: 12px 6px;
  border-radius: 0 0 20px 20px;
}
.patch-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}
.border-right {
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}
.p-icon {
  font-size: 16px;
}
.p-label {
  font-size: 10px;
  color: #444;
}
.p-value {
  font-size: 11px;
  font-weight: bold;
}
.status-active {
  color: #2e6b5e;
}

/* Sections */
.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 10px;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.metric-card {
  border-radius: 20px;
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.bg-red {
  background-color: #fddcdb;
}
.bg-blue {
  background-color: #d6e2f9;
}
.bg-orange {
  background-color: #fde0cc;
}
.bg-green-light {
  background-color: #d1ebd9;
}

.m-icon {
  font-size: 20px;
}
.m-content {
  display: flex;
  flex-direction: column;
}
.m-label {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}
.m-value {
  font-size: 13px;
  font-weight: bold;
  color: #111;
  margin-top: 2px;
}
.m-value small {
  font-weight: normal;
  font-size: 10px;
  color: #555;
}
.txt-green {
  color: #00a86b;
}

/* Dual Row (Summary + Score) */
.dual-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 12px;
}
.summary-card,
.score-card {
  background: white;
  border-radius: 20px;
  padding: 14px;
}
.summary-card h3,
.score-card h3 {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
}
.summary-card ul {
  padding-left: 14px;
  font-size: 11px;
  color: #444;
  line-height: 1.5;
}
.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}
.gauge-arc {
  width: 80px;
  height: 40px;
  background: #00bf72;
  border-radius: 80px 80px 0 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.gauge-inner {
  width: 60px;
  height: 30px;
  background: white;
  border-radius: 65px 65px 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.score-val {
  font-size: 16px;
  font-weight: bold;
  position: relative;
  bottom: -4px;
}
.score-status {
  font-size: 11px;
  color: #00bf72;
  font-weight: 500;
  margin-top: 8px;
}

/* Recommendation */
.recommendation-card {
  background-color: #ffffff;
  border: 1px solid #f0eae1;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}
.recommendation-card h3 {
  font-size: 14px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 12px;
}
.rec-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  font-size: 13px;
  color: #222222;
  font-weight: 500;
}
.view-more {
  align-self: center;
  background: none;
  border: none;
  color: #449284;
  font-size: 12px;
  font-weight: 500;
  margin-top: 12px;
  cursor: pointer;
}

/* Quick Action */
.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.act-icon{
  font-size: 20px;
}
.act-btn {
  border: none;
  border-radius: 16px;
  padding: 15px 7px;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.btn-mint {
  background-color: #cdeee4;
}
.btn-purple {
  background-color: #dce2f7;
}
.btn-peach {
  background-color: #fce1cd;
}
.btn-rose {
  background-color: #fcdcdb;
}
.text-danger {
  color: #d9534f;
}

/* Bottom Nav Bar */
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
.nav-item.active {
  color: #449284;
}
.nav-icon {
  font-size: 18px;
}
.nav-label {
  font-size: 10px;
  font-weight: 500;
}
</style>