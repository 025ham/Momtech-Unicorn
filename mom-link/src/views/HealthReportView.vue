<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/health'
import { useContactStore } from '@/stores/contacts'
import { useUserStore } from '@/stores/user'
import IconBack from '@/components/icons/IconBack.vue'
import IconHeart from '@/components/icons/IconHeart.vue'
import IconBaby from '@/components/icons/IconBaby.vue'
import IconTemperature from '@/components/icons/IconTemperature.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import IconShare from '@/components/icons/IconShare.vue'
import IconHome from '@/components/icons/IconHome.vue'
import IconTrendUp from '@/components/icons/IconTrendUp.vue'
import IconSmile from '@/components/icons/IconSmile.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconDoctor from '@/components/icons/IconDoctor.vue'
import IconPhone from '@/components/icons/IconPhone.vue'
import IconClose from '@/components/icons/IconClose.vue'

const router = useRouter()
const healthStore = useHealthStore()
const contactStore = useContactStore()
const userStore = useUserStore()

onMounted(async () => {
  await healthStore.fetchLogs(100)
  await userStore.fetchUser()
})

const goBack = () => {
  router.push('/')
}

// Time filter
const activeFilter = ref('today')
const filters = ['today', 'week', 'month']

const setFilter = (filter) => {
  activeFilter.value = filter
  applyFilter()
}

// Apply time filter to logs
const applyFilter = () => {
  const logs = healthStore.logs
  if (!logs.length) return []

  const now = new Date()
  let cutoffDate = new Date()

  if (activeFilter.value === 'today') {
    cutoffDate.setHours(0, 0, 0, 0)
  } else if (activeFilter.value === 'week') {
    cutoffDate.setDate(now.getDate() - 7)
  } else if (activeFilter.value === 'month') {
    cutoffDate.setMonth(now.getMonth() - 1)
  }

  return logs.filter(l => new Date(l.logged_at) >= cutoffDate)
}

// Real data from store with filter applied
const filteredLogs = computed(() => applyFilter())
const heartRateData = computed(() => filteredLogs.value.map(l => l.heart_rate).filter(Boolean))
const movementData = computed(() => filteredLogs.value.map(l => l.baby_movement).filter(Boolean))
const temperatureData = computed(() => filteredLogs.value.map(l => l.temperature).filter(Boolean))

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

// Share to Doctor modal
const showShareModal = ref(false)
const doctorContacts = computed(() => contactStore.contacts.filter(c => c.contact_type === 'doctor'))

const openShareModal = async () => {
  await contactStore.fetchContacts()
  showShareModal.value = true
}

const shareToDoctor = (doctor) => {
  const logs = filteredLogs.value
  const summary = `Health Report - MomLink\nDate: ${new Date().toLocaleDateString()}\nPeriod: ${activeFilter.value}\n========================\nHeart Rate: ${logs[0]?.heart_rate || '-'} bpm\nTemperature: ${logs[0]?.temperature || '-'}°C\nBaby Movement: ${logs[0]?.baby_movement || '-'} times\nStress Level: ${logs[0]?.stress_level || '-'}\n========================\nPatient: ${userStore.user?.name || 'N/A'}\nAge: ${userStore.user?.age || 'N/A'}\nPregnancy Week: ${userStore.user?.pregnancy_week || 'N/A'}\nHospital: ${userStore.user?.hospital || 'N/A'}\nDoctor: ${userStore.user?.doctor || 'N/A'}`

  if (navigator.share) {
    navigator.share({ title: 'MomLink Health Report', text: summary }).catch(() => {})
  } else {
    window.location.href = `tel:${doctor.phone}`
  }
  showShareModal.value = false
}

// PDF Download
const downloadPDF = () => {
  const logs = filteredLogs.value
  const user = userStore.user || {}

  // Build HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Health Report - MomLink</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #5DC6BA; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #5DC6BA; margin: 0 0 5px 0; font-size: 28px; }
    .header h2 { color: #333; margin: 0; font-size: 18px; font-weight: normal; }
    .patient-info { background: #f5f5f5; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
    .patient-info h3 { margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item { display: flex; justify-content: space-between; padding: 5px 0; }
    .info-label { color: #666; }
    .info-value { font-weight: bold; color: #333; }
    .section { margin-bottom: 30px; }
    .section h3 { color: #333; border-bottom: 2px solid #5DC6BA; padding-bottom: 10px; margin-bottom: 15px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .stat-card { background: #f9f9f9; padding: 15px; border-radius: 10px; text-align: center; border: 1px solid #eee; }
    .stat-value { font-size: 24px; font-weight: bold; color: #5DC6BA; }
    .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
    .log-table { width: 100%; border-collapse: collapse; }
    .log-table th { background: #5DC6BA; color: white; padding: 10px; text-align: left; }
    .log-table td { padding: 10px; border-bottom: 1px solid #eee; }
    .log-table tr:nth-child(even) { background: #f9f9f9; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MomLink</h1>
    <h2>Health Report</h2>
  </div>

  <div class="patient-info">
    <h3>Patient Information</h3>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Name:</span><span class="info-value">${user.name || 'N/A'}</span></div>
      <div class="info-item"><span class="info-label">Age:</span><span class="info-value">${user.age || 'N/A'} years</span></div>
      <div class="info-item"><span class="info-label">Pregnancy Week:</span><span class="info-value">Week ${user.pregnancy_week || 'N/A'}</span></div>
      <div class="info-item"><span class="info-label">Blood Type:</span><span class="info-value">${user.blood_type || 'N/A'}</span></div>
      <div class="info-item"><span class="info-label">Due Date:</span><span class="info-value">${user.due_date || 'N/A'}</span></div>
      <div class="info-item"><span class="info-label">Hospital:</span><span class="info-value">${user.hospital || 'N/A'}</span></div>
      <div class="info-item"><span class="info-label">Doctor:</span><span class="info-value">${user.doctor || 'N/A'}</span></div>
      <div class="info-item"><span class="info-label">Allergies:</span><span class="info-value">${user.allergies || 'None'}</span></div>
    </div>
  </div>

  <div class="section">
    <h3>Health Summary (${activeFilter.value})</h3>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${logs[0]?.heart_rate || '-'}</div>
        <div class="stat-label">Heart Rate (bpm)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${logs[0]?.temperature || '-'}</div>
        <div class="stat-label">Temperature (°C)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${logs[0]?.baby_movement || '-'}</div>
        <div class="stat-label">Baby Movement</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>Health Logs</h3>
    <table class="log-table">
      <thead>
        <tr>
          <th>Date/Time</th>
          <th>Heart Rate</th>
          <th>Temperature</th>
          <th>Baby Movement</th>
          <th>Stress Level</th>
        </tr>
      </thead>
      <tbody>
        ${logs.slice(0, 20).map(l => `
        <tr>
          <td>${l.logged_at ? new Date(l.logged_at).toLocaleString() : 'N/A'}</td>
          <td>${l.heart_rate || '-'}</td>
          <td>${l.temperature || '-'}</td>
          <td>${l.baby_movement || '-'}</td>
          <td>${l.stress_level || 'N/A'}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Generated by MomLink Health App on ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
  `

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
  }
}

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
      <button class="back-btn" @click="goBack"><IconBack :size="18" /></button>
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
        @click="setFilter(f)"
      >
        {{ f.charAt(0).toUpperCase() + f.slice(1) }}
      </button>
    </section>

    <!-- Heart Rate Chart -->
    <section class="card chart-card">
      <div class="chart-header">
        <span class="chart-title"><IconHeart :size="14" color="#d9534f" /> Heart Rate</span>
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
        <span class="chart-title"><IconBaby :size="14" color="#2b5c8f" /> Baby Movement</span>
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
        <span class="chart-title"><IconTemperature :size="14" color="#e26d5c" /> Temperature</span>
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
        <button class="report-btn btn-download" @click="downloadPDF"><IconDownload :size="14" /> Download PDF</button>
        <button class="report-btn btn-share" @click="openShareModal"><IconShare :size="14" /> Share to Doctor</button>
      </div>
    </section>

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

    <!-- Bottom Nav-->
    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')">
        <span class="nav-icon"><IconHome :size="20" /></span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item" @click="router.push('/monitor')">
        <span class="nav-icon"><IconTrendUp :size="20" /></span>
        <span class="nav-label">Monitor</span>
      </button>
      <button class="nav-item" @click="router.push('/ai-analysis')">
        <span class="nav-icon"><IconSmile :size="20" /></span>
        <span class="nav-label">AI Analysis</span>
      </button>
      <button class="nav-item" @click="router.push('/profile')">
        <span class="nav-icon"><IconUser :size="20" /></span>
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
.nav-item.active { color: #5DC6BA; }
.nav-item.active::after { width: 24px; }
.nav-icon { font-size: 18px; }
.nav-label { font-size: 10px; font-weight: 500; }
</style>
