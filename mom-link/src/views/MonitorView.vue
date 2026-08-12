<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/health'
import { useContactStore } from '@/stores/contacts'
import { useUserStore } from '@/stores/user'
import IconBack from '@/components/icons/IconBack.vue'
import IconHeart from '@/components/icons/IconHeart.vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'
import IconShare from '@/components/icons/IconShare.vue'
import IconFeetPink from '@/components/icons/IconFeetPink.vue'
import IconFeetBlue from '@/components/icons/IconFeetBlue.vue'
import IconDoctor from '@/components/icons/IconDoctor.vue'
import IconPhone from '@/components/icons/IconPhone.vue'
import IconClose from '@/components/icons/IconClose.vue'

const router = useRouter()
const healthStore = useHealthStore()
const contactStore = useContactStore()
const userStore = useUserStore()

const goBack = () => router.push('/')

// Share to Doctor modal
const showShareModal = ref(false)

const doctorContacts = computed(() => {
  return contactStore.contacts.filter(c => c.contact_type === 'doctor')
})

const openShareModal = async () => {
  // Load fallback contacts directly if store is empty
  if (contactStore.contacts.length === 0) {
    contactStore.contacts = [
      { id: 1, name: 'Emergency Services', phone: '1669', contact_type: 'emergency' },
      { id: 2, name: 'John (Husband)', phone: '081-234-5678', contact_type: 'personal' },
      { id: 3, name: 'Dr. Maria Chen', phone: '089-123-4567', contact_type: 'doctor' },
    ]
  }
  showShareModal.value = true
}

const shareToDoctor = (doctor) => {
  const logs = healthStore.logs
  const summary = `Health Report - MomLink\nDate: ${new Date().toLocaleDateString()}\n========================\nHeart Rate: ${logs[0]?.heart_rate || '-'} bpm\nTemperature: ${logs[0]?.temperature || '-'}°C\nBaby Movement: ${logs[0]?.baby_movement || '-'} times\nStress Level: ${logs[0]?.stress_level || '-'}\n========================\nPatient: ${userStore.user?.name || 'N/A'}\nHospital: ${userStore.user?.hospital || 'N/A'}`

  // Try native share first, fall back to calling
  if (navigator.share) {
    navigator.share({
      title: 'MomLink Health Report',
      text: summary
    }).catch(() => {
      // Fall back to phone call
      window.location.href = `tel:${doctor.phone}`
    })
  } else {
    window.location.href = `tel:${doctor.phone}`
  }
  showShareModal.value = false
}

// Real data from store
const heartRate = computed(() => healthStore.latest?.heart_rate || '--')
const temperature = computed(() => healthStore.latest?.temperature || '--')
const stressLevel = computed(() => healthStore.latest?.stress_level || 'N/A')
const movementCurrent = computed(() => healthStore.latest?.baby_movement || 0)
const movementTarget = ref(20)

const timelineEvents = ref([
  { time: '17:00', type: 'pink', active: false },
  { time: '17:30', type: 'blue', active: true },
  { time: '18:20', type: 'pink', active: false }
])

// Heart Rate Graph - use shared history from store simulation
const heartRateHistory = ref([140, 142, 138, 141, 145, 143, 139, 142, 146, 144, 140, 143])
const movementHistory = ref([7, 9, 6, 8, 10, 7, 9, 11, 8, 10, 7, 9])
const temperatureHistory = ref([36.5, 36.6, 36.4, 36.5, 36.7, 36.5, 36.4, 36.6, 36.7, 36.5, 36.4, 36.5])

// Use refs instead of computed so graph updates when data changes
const heartRateData = ref([140, 142, 138, 141, 145, 143, 139, 142, 146, 144, 140, 143])
const movementData = ref([7, 9, 6, 8, 10, 7, 9, 11, 8, 10, 7, 9])
const temperatureData = ref([36.5, 36.6, 36.4, 36.5, 36.7, 36.5, 36.4, 36.6, 36.7, 36.5, 36.4, 36.5])

// Watch store's latest value and update graph + local history
watch(() => healthStore.latest, (newVal) => {
  if (newVal && newVal.heart_rate) {
    // Update histories
    heartRateHistory.value = [...heartRateHistory.value.slice(1), newVal.heart_rate]
    movementHistory.value = [...movementHistory.value.slice(1), newVal.baby_movement || movementHistory.value[movementHistory.value.length - 1]]
    temperatureHistory.value = [...temperatureHistory.value.slice(1), newVal.temperature || temperatureHistory.value[temperatureHistory.value.length - 1]]
    // Update graph data
    heartRateData.value = [...heartRateHistory.value]
    movementData.value = [...movementHistory.value]
    temperatureData.value = [...temperatureHistory.value]
  }
}, { deep: true })

const updateGraphData = () => {
  const logs = healthStore.logs.slice(0, 12).reverse()
  const apiHR = logs.map(l => l.heart_rate).filter(Boolean)
  const apiMov = logs.map(l => l.baby_movement).filter(Boolean)
  const apiTemp = logs.map(l => l.temperature).filter(Boolean)

  if (apiHR.length > 0) {
    heartRateData.value = apiHR
  }

  if (apiMov.length > 0) {
    movementData.value = apiMov
  }

  if (apiTemp.length > 0) {
    temperatureData.value = apiTemp
  }
}

const maxHR = 180
const minHR = 100
const graphPoints = computed(() => {
  const width = 300
  const height = 120
  const padding = 10
  const data = heartRateData.value
  if (data.length < 2) return []
  const stepX = (width - padding * 2) / (data.length - 1)
  return data.map((val, i) => {
    const x = padding + i * stepX
    const y = height - padding - ((val - minHR) / (maxHR - minHR)) * (height - padding * 2)
    return { x, y, val }
  })
})

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

const currentHR = computed(() => {
  return healthStore.latest?.heart_rate || '--'
})

onMounted(() => {
  healthStore.fetchLogs(50).then(() => {
    updateGraphData()
  })

  // Start simulation if no real data
  if (healthStore.logs.length === 0) {
    healthStore.startSimulation()
  }
})

onUnmounted(() => {
  // Don't stop simulation - it belongs to the store and can be used by other views
})

const exportAndShare = () => {
  const logs = healthStore.logs
  if (logs.length === 0) {
    alert('No data to share')
    return
  }
  openShareModal()
}

const refreshData = () => {
  healthStore.fetchLatest()
  healthStore.fetchStats()
  healthStore.fetchLogs(50).then(() => {
    updateGraphData()
  })
}
</script>

<template>
  <div class="monitor-view">
    <!-- Top Nav -->
    <header class="app-header">
      <button class="back-btn" @click="goBack"><IconBack :size="18" /></button>
      <h1>Live Monitoring</h1>
      <div style="width: 24px;"></div> <!-- รักษาสมดุลกึ่งกลาง -->
    </header>

    <!-- Heart Rate -->
    <section class="card heart-rate-card">
      <div class="card-header">
        <span class="title">Heart Rate</span>
        <span class="value"><IconHeart :size="14" color="#d9534f" /> {{ heartRate }} <small>bpm</small></span>
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
            <span class="feet-icon"><IconFeetPink v-if="event.type === 'pink'" :size="16" /><IconFeetBlue v-else :size="16" /></span>
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

    <!-- Share to Doctor Modal -->
    <div v-if="showShareModal" class="share-modal-overlay" @click="showShareModal = false">
      <div class="share-modal" @click.stop>
        <div class="modal-header">
          <h3>Share to Doctor</h3>
          <button class="close-btn" @click="showShareModal = false"><IconClose :size="18" /></button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Select a doctor to share your health report</p>
          <div v-if="doctorContacts.length === 0" class="no-contacts">
            No doctor contacts found
          </div>
          <div v-for="doctor in doctorContacts" :key="doctor.id" class="doctor-item" @click="shareToDoctor(doctor)">
            <div class="doctor-icon"><IconDoctor :size="24" /></div>
            <div class="doctor-info">
              <span class="doctor-name">{{ doctor.name }}</span>
              <span class="doctor-phone">{{ doctor.phone }}</span>
            </div>
            <button class="call-btn"><IconPhone :size="16" /></button>
          </div>
          <div v-if="!doctorContacts.length" class="all-contacts">
            <p class="modal-desc">Other contacts:</p>
            <div v-for="contact in contactStore.contacts" :key="contact.id" class="doctor-item" @click="shareToDoctor(contact)">
              <div class="doctor-icon"><IconDoctor :size="24" /></div>
              <div class="doctor-info">
                <span class="doctor-name">{{ contact.name }}</span>
                <span class="doctor-phone">{{ contact.phone }}</span>
              </div>
              <button class="call-btn"><IconPhone :size="16" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-row">
      <button class="action-btn btn-refresh" @click="refreshData"><IconRefresh :size="16" /><span>Refresh</span></button>
      <button class="action-btn btn-export" @click="openShareModal"><IconShare :size="16" /><span>Share to Doctor</span></button>
    </div>
  </div>
</template>

<style scoped>
.monitor-view {
  background-color: #fcf8f2;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.btn-refresh { background-color: #fcdcdb; color: #333; }
.btn-export { background-color: #afe1d1; color: #1a302a; }

/* Share Modal */
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.share-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 340px;
  max-height: 70vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}
.modal-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
}
.modal-body {
  padding: 16px;
}
.modal-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}
.no-contacts {
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 13px;
}
.doctor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.doctor-item:hover {
  background: #f0f7ff;
}
.doctor-icon {
  width: 40px;
  height: 40px;
  background: #d1ebd9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.doctor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.doctor-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.doctor-phone {
  font-size: 12px;
  color: #888;
}
.all-contacts {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}
</style>