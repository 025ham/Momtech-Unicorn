<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/health'
import { useUserStore } from '@/stores/user'
import { useDeviceStore } from '@/stores/devices'
import { useNotificationStore } from '@/stores/notifications'
import IconWave from '@/components/icons/IconWave.vue'
import IconBell from '@/components/icons/IconBell.vue'
import IconSettings from '@/components/icons/IconSettings.vue'
import IconBluetooth from '@/components/icons/IconBluetooth.vue'
import IconBattery from '@/components/icons/IconBattery.vue'
import IconSignal from '@/components/icons/IconSignal.vue'
import IconHeart from '@/components/icons/IconHeart.vue'
import IconBaby from '@/components/icons/IconBaby.vue'
import IconTemperature from '@/components/icons/IconTemperature.vue'
import IconSmile from '@/components/icons/IconSmile.vue'
import IconTrendUp from '@/components/icons/IconTrendUp.vue'
import IconDocument from '@/components/icons/IconDocument.vue'
import IconWarning from '@/components/icons/IconWarning.vue'

const router = useRouter()
const healthStore = useHealthStore()
const userStore = useUserStore()
const deviceStore = useDeviceStore()
const notificationStore = useNotificationStore()

// Notification system (from store)
const showNotifications = ref(false)
const notifications = computed(() => notificationStore.notifications)
const hasUnread = computed(() => notificationStore.getUnreadCount() > 0)

const markAsRead = (id) => notificationStore.markAsRead(id)
const markAllAsRead = () => notificationStore.markAllAsRead()

onMounted(async () => {
  // Restore activeDevice from localStorage first
  const savedActive = localStorage.getItem('momlink_demo_active')
  const savedDevices = localStorage.getItem('momlink_demo_devices')
  if (savedDevices) {
    try {
      const parsed = JSON.parse(savedDevices)
      if (parsed.length > 0) {
        deviceStore.devices = parsed
        // Find device by is_active flag first, then by savedActive id
        let active = parsed.find(d => d.is_active === 1)
        if (!active && savedActive) {
          active = parsed.find(d => d.id == savedActive)
        }
        if (!active) {
          active = parsed[0] // fallback to first device
        }
        deviceStore.activeDevice = active || null
      }
    } catch (e) {}
  }

  // ALWAYS set health values based on active device type - don't rely on existing values
  if (deviceStore.activeDevice) {
    const isEmergency = deviceStore.activeDevice.is_emergency ||
                       deviceStore.activeDevice.name?.includes('Emergency')
    startHealthUpdates(isEmergency)
  } else {
    // No device - set normal values and start updates
    startHealthUpdates(false)
  }

  // Fetch data - but don't wait for all to complete
  healthStore.fetchStats().then(() => {
    if (!healthStore.stats) {
      healthStore.stats = {
        avg_heart_rate: 75,
        avg_temperature: 36.8,
        avg_baby_movement: 8,
        total_logs: 50,
      }
    }
  }).catch(() => {
    healthStore.stats = {
      avg_heart_rate: 75,
      avg_temperature: 36.8,
      avg_baby_movement: 8,
      total_logs: 50,
    }
  })

  userStore.fetchUser().catch(() => {})
})

// Health value state for live updates
let currentHR = 130  // Safe initial value in normal pregnancy range
let currentTemp = 36.8
let healthInterval = null

const startHealthUpdates = (isEmergency) => {
  // Clear existing interval
  if (healthInterval) {
    clearInterval(healthInterval)
    healthInterval = null
  }

  // Set initial values
  if (isEmergency) {
    currentHR = 175
    currentTemp = 38.2
  } else {
    // Normal: HR 120-160
    currentHR = Math.floor(Math.random() * 41) + 120  // 120-160
    currentTemp = parseFloat((36.5 + Math.random() * 0.3).toFixed(1)) // 36.5-36.8
  }

  healthStore.latest = {
    heart_rate: currentHR,
    temperature: currentTemp,
    baby_movement: isEmergency ? 1 : 10,
    stress_level: isEmergency ? 'High' : 'Normal',
    logged_at: new Date().toISOString(),
  }

  // Update every 5 seconds
  healthInterval = setInterval(() => {
    if (deviceStore.activeDevice?.is_emergency ||
        deviceStore.activeDevice?.name?.includes('Emergency')) {
      // Emergency: HR changes +/- 1, temp changes +/- 0.1
      currentHR = Math.max(170, Math.min(200, currentHR + (Math.random() > 0.5 ? 1 : -1)))
      currentTemp = Math.max(37.8, Math.min(39.0, currentTemp + (Math.random() > 0.5 ? 0.1 : -0.1)))
      currentTemp = parseFloat(currentTemp.toFixed(1))
    } else {
      // Normal: HR 120-160 changes +/- 1, temp changes +/- 0.1
      currentHR = Math.max(120, Math.min(160, currentHR + (Math.random() > 0.5 ? 1 : -1)))
      currentTemp = Math.max(36.2, Math.min(37.0, currentTemp + (Math.random() > 0.5 ? 0.1 : -0.1)))
      currentTemp = parseFloat(currentTemp.toFixed(1))
    }

    healthStore.latest = {
      heart_rate: currentHR,
      temperature: currentTemp,
      baby_movement: deviceStore.activeDevice?.is_emergency ? 1 : 10,
      stress_level: deviceStore.activeDevice?.is_emergency ? 'High' : 'Normal',
      logged_at: new Date().toISOString(),
    }
  }, 5000)
}

onUnmounted(() => {
  if (healthInterval) {
    clearInterval(healthInterval)
    healthInterval = null
  }
})
const healthScore = computed(() => {
  const latest = healthStore.latest
  if (!latest || latest.heart_rate == null) return 0

  // Check for emergency conditions
  const hr = latest.heart_rate || 0
  const temp = latest.temperature || 36.5
  const movement = latest.baby_movement ?? 10
  const stress = latest.stress_level || 'Normal'

  // Emergency thresholds (pregnancy-adjusted: HR 60-170 is normal for pregnant women)
  if (hr > 170 || hr < 50 || temp > 38.5 || temp < 35.5 || movement <= 2 || stress === 'High') {
    return Math.floor(Math.random() * 20 + 15) // 15-35% for emergency
  }

  // Calculate score based on all metrics
  let score = 100

  // Heart rate (normal 60-170 for pregnancy)
  if (hr > 170) score -= (hr - 170) * 3
  if (hr < 60) score -= (60 - hr) * 2

  // Temperature (normal 36.0-37.5 for pregnancy)
  if (temp > 37.5) score -= (temp - 37.5) * 15
  if (temp < 36.0) score -= (36.0 - temp) * 15

  // Baby movement (normal 3+)
  if (movement < 3) score -= (3 - movement) * 8
  if (movement < 5) score -= (5 - movement) * 2

  // Stress level
  if (stress === 'High') score -= 25
  else if (stress === 'Medium') score -= 10

  return Math.max(15, Math.min(100, Math.floor(score)))
})

const healthScoreLabel = computed(() => {
  const score = healthScore.value
  if (score === 0) return 'No Data'
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Fair'
  if (score >= 40) return 'Concerning'
  return 'Critical'
})

const healthScoreColor = computed(() => {
  const score = healthScore.value
  if (score === '--') return '#ccc'
  if (score >= 75) return '#00bf72'
  if (score >= 50) return '#e26d5c'
  return '#d9534f'
})

// Dynamic AI Recommendations based on health data and device status
const recommendations = computed(() => {
  const latest = healthStore.latest || {}
  const device = deviceStore.activeDevice
  const hr = latest.heart_rate || 0
  const temp = latest.temperature || 36.5
  const movement = latest.baby_movement ?? 10
  const stress = latest.stress_level || 'Normal'

  const recs = []

  // Check if device is connected
  if (!device) {
    recs.push('🔗 Connect a device for real-time monitoring')
    recs.push('📱 Pair your health devices in Bluetooth settings')
    return recs
  }

  // Emergency recommendations
  if (hr > 170 || hr < 50) {
    recs.push('⚠️ Heart rate is abnormal - consult doctor')
  }
  if (temp > 38.0) {
    recs.push('🌡️ Temperature is elevated - rest and monitor')
  }
  if (temp > 38.5) {
    recs.push('🚨 High fever detected - seek medical help')
  }
  if (movement <= 2) {
    recs.push('👶 Low fetal movement - drink cold water and rest')
  }
  if (movement === 0) {
    recs.push('🚨 No movement detected - contact doctor immediately')
  }
  if (stress === 'High') {
    recs.push('🧘 Try deep breathing exercises')
    recs.push('☀️ Consider light meditation')
  }

  // If all is well, give positive recommendations
  if (recs.length === 0) {
    recs.push('✨ Everything looks great! Keep it up')
    recs.push('💧 Drink 8 glasses of water today')
    recs.push('🚶‍♀️ Light walk is good for you')
    recs.push('🥗 Eat nutrient-rich foods')
    recs.push('😴 Remember to get adequate rest')
    recs.push('📋 Attend your scheduled checkups')
    return recs
  }

  // Add general wellness tips alongside emergency ones
  recs.push('💧 Stay hydrated - drink water regularly')
  recs.push('🥗 Eat small, nutritious meals')
  recs.push('😴 Get enough sleep (7-9 hours)')

  return recs.slice(0, 6) // Limit to 6 recommendations
})
</script>

<template>
  <div class="home-view">
    <header class="app-header">
      <div class="user-profile">
        <span class="avatar"><IconWave :size="28" /></span>
        <div class="user-text">
          <h1>Good Morning, {{ userStore.user?.name?.split(' ')[0] || 'Mother' }}</h1>
          <p class="sub-text">Week {{ userStore.user?.pregnancy_week || '-' }} Pregnancy</p>
        </div>
      </div>
      <div class="header-icons">
        <button class="icon-btn notification" @click="showNotifications = !showNotifications">
          <IconBell :size="20" :color="showNotifications ? '#5DC6BA' : '#000000'" />
          <span v-if="hasUnread" class="badge-dot"></span>
        </button>
        <button class="icon-btn" @click="router.push('/home/profile')"><IconSettings :size="20" /></button>
      </div>
    </header>

    <!-- Notification Panel -->
    <div v-if="showNotifications" class="notification-panel" @click="showNotifications = false">
      <div class="notification-content" @click.stop>
        <div class="notification-header">
          <h3>Notifications</h3>
          <div class="header-actions">
            <button class="mark-all-btn" @click="markAllAsRead">Mark all read</button>
            <button class="close-btn" @click="showNotifications = false">✕</button>
          </div>
        </div>
        <div class="notification-list">
          <div v-if="notifications.length === 0" class="no-notification">
            No new notifications
          </div>
          <div v-for="notif in notifications" :key="notif.id" class="notification-item" :class="{ unread: !notif.read, emergency: notif.is_emergency, faded: notif.read }">
            <div class="notif-icon" :class="{ 'emergency-bg': notif.is_emergency }"><IconBell :size="16" /></div>
            <div class="notif-content">
              <div class="notif-title">{{ notif.title }}</div>
              <div class="notif-time">{{ notif.time }}</div>
            </div>
            <button v-if="!notif.read" class="mark-read-btn" @click.stop="markAsRead(notif.id)">✓</button>
          </div>
        </div>
      </div>
    </div>

    <section class="momentum-patch-card">
      <div class="card-title">Momentum Patch</div>
      <div class="patch-grid">
        <div class="patch-item border-right">
          <span class="p-icon"><IconBluetooth :size="22" /></span>
          <div class="p-info">
            <span class="p-label">Device Status : </span>
            <span class="p-value" :class="{ 'status-active': deviceStore.activeDevice, 'status-inactive': !deviceStore.activeDevice }">
              {{ deviceStore.activeDevice ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
        </div>
        <div class="patch-item border-right">
          <span class="p-icon"><IconBattery :size="22" /></span>
          <div class="p-info">
            <span class="p-label">Battery :</span>
            <span class="p-value">--%</span>
          </div>
        </div>
        <div class="patch-item">
          <span class="p-icon"><IconSignal :size="22" /></span>
          <div class="p-info">
            <span class="p-label">Bluetooth :</span>
            <span class="p-value" :class="{ 'status-active': deviceStore.activeDevice }">
              {{ deviceStore.activeDevice ? 'Strong' : 'No Device' }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="section-container">
      <h2 class="section-title">Today's Baby Health</h2>
      <div class="metrics-grid">
        <div class="metric-card bg-red">
          <span class="m-icon"><IconHeart :size="22" /></span>
          <div class="m-content">
            <span class="m-label">Heart Rate</span>
            <span class="m-value">
              {{ healthStore.latest?.heart_rate || '-' }} <small>bpm</small>
            </span>
          </div>
        </div>
        <div class="metric-card bg-blue">
          <span class="m-icon"><IconBaby :size="22" /></span>
          <div class="m-content">
            <span class="m-label">Baby Movement</span>
            <span class="m-value">{{ healthStore.latest?.baby_movement || '-' }} <small>Time/Today</small></span>
          </div>
        </div>
        <div class="metric-card bg-orange">
          <span class="m-icon"><IconTemperature :size="22" /></span>
          <div class="m-content">
            <span class="m-label">Temperature</span>
            <span class="m-value">{{ healthStore.latest?.temperature ? healthStore.latest.temperature + '°C' : '--°C' }}</span>
          </div>
        </div>
        <div class="metric-card bg-green-light">
          <span class="m-icon"><IconSmile :size="22" /></span>
          <div class="m-content">
            <span class="m-label">Stress</span>
            <span class="m-value txt-green">{{ healthStore.latest?.stress_level || 'N/A' }}</span>
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
          <div class="gauge-arc" :style="{ background: healthScoreColor }">
            <div class="gauge-inner">
              <span class="score-val">{{ healthScore }}%</span>
            </div>
          </div>
          <span class="score-status" :style="{ color: healthScoreColor }">{{ healthScoreLabel }}</span>
        </div>
      </div>
    </div>

    <section class="recommendation-card">
      <h3>AI Recommendation</h3>
      <div class="rec-grid">
        <div v-for="(rec, idx) in recommendations" :key="idx" class="rec-item">{{ rec }}</div>
      </div>
    </section>

    <section class="section-container">
      <h2 class="section-title">Quick Action</h2>
      <div class="action-grid">
        <button class="act-btn btn-mint" @click="router.push('/home/monitor')"><span class="act-icon"><IconTrendUp :size="20" color="#00a86b" /></span> Live Monitor</button>
        <button class="act-btn btn-purple" @click="router.push('/home/ai-analysis')"><span class="act-icon"><IconSmile :size="20" color="#6b5b95" /></span> AI Analysis</button>
        <button class="act-btn btn-peach" @click="router.push('/home/health-report')"><span class="act-icon"><IconDocument :size="20" color="#d35400" /></span> Report</button>
        <button class="act-btn btn-rose text-danger" @click="router.push('/emergency')">
          <span class="act-icon"><IconWarning :size="20" color="#c0392b" /></span> Emergency
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  background-color: #fcf8f2;
  width: 100%;
  min-height: 100%;
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
  width: 8px;
  height: 8px;
  background-color: #FF5A5A;
  border-radius: 50%;
  border: 2px solid white;
}

/* Notification Panel */
.notification-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}
.notification-content {
  width: 85%;
  max-width: 360px;
  height: 100%;
  background: white;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}
.notification-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.mark-all-btn {
  background: none;
  border: none;
  font-size: 11px;
  color: #449284;
  cursor: pointer;
}
.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #888;
  cursor: pointer;
}
.notification-list {
  padding: 8px;
}
.no-notification {
  text-align: center;
  padding: 24px;
  color: #888;
  font-size: 14px;
}
.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 8px;
  transition: background 0.2s, opacity 0.3s;
  align-items: center;
}
.notification-item:hover {
  background: #f9f9f9;
}
.notification-item.unread {
  background: #f0f7ff;
}
.notification-item.faded {
  opacity: 0.5;
}
.notification-item.emergency {
  background: #fddcdb;
  border: 1px solid #ffcccc;
}
.emergency-bg {
  background: #ff6b6b !important;
}
.mark-read-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #449284;
  background: white;
  color: #449284;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mark-read-btn:hover {
  background: #449284;
  color: white;
}
.notif-icon {
  width: 32px;
  height: 32px;
  background: #d1ebd9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notif-content {
  flex: 1;
}
.notif-title {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}
.notif-time {
  font-size: 11px;
  color: #888;
  margin-top: 4px;
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
  font-size: 17px;
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
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 15px;
  color: #333;
  font-weight: bolder;
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
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 8px;
}
.summary-card ul {
  padding-left: 14px;
  font-size: 13px;
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
  position: relative;
  padding: 4px 12px;
}
.nav-item::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background-color: #5DC6BA;
  border-radius: 2px;
  transition: width 0.2s ease;
}
.nav-item.active {
  color: #5DC6BA;
}
.nav-item.active::after {
  width: 24px;
}
.nav-icon {
  font-size: 18px;
}
.nav-label {
  font-size: 10px;
  font-weight: 500;
}
</style>