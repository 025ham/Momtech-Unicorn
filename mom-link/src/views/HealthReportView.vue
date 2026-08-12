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
import IconDoctor from '@/components/icons/IconDoctor.vue'
import IconPhone from '@/components/icons/IconPhone.vue'
import IconClose from '@/components/icons/IconClose.vue'

const router = useRouter()
const healthStore = useHealthStore()
const contactStore = useContactStore()
const userStore = useUserStore()

onMounted(async () => {
  // Fetch user first
  await userStore.fetchUser()

  // Always generate mock data for demo - cover 60 days for multi-month support
  const now = new Date()
  const mockLogs = []

  // Generate data for 60 days, multiple entries per day
  for (let day = 0; day < 60; day++) {
    for (let hour = 0; hour < 24; hour += 2) { // Every 2 hours
      const loggedAt = new Date(now)
      loggedAt.setDate(loggedAt.getDate() - day)
      loggedAt.setHours(hour, 0, 0, 0)

      // Heart rate varies by time of day (higher during day)
      const baseHR = 72 + (hour >= 8 && hour <= 20 ? 10 : 0) + Math.floor(Math.random() * 10)
      const hr = Math.floor(baseHR)

      // Temperature stays fairly stable
      const temp = parseFloat((36.4 + Math.random() * 0.6).toFixed(1))

      // Baby movement - varies by time
      const movement = Math.floor(Math.random() * 8 + 4)

      const stressOptions = ['Low', 'Normal', 'Medium', 'Normal', 'Low']
      const stress = stressOptions[Math.floor(Math.random() * stressOptions.length)]

      mockLogs.push({
        id: now.getTime() + day * 100 + hour,
        heart_rate: hr,
        temperature: temp,
        baby_movement: Math.max(2, movement),
        stress_level: stress,
        logged_at: loggedAt.toISOString(), // Use ISO format for consistency
      })
    }
  }
  healthStore.logs = mockLogs
})

const goBack = () => {
  router.push('/')
}

// Time filter - add 'day' option for more granular view
const activeFilter = ref('week')
const filters = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' }
]

// Date/Week selectors
const selectedDate = ref(new Date().toLocaleDateString('en-CA')) // Today for Day view (local time)
const selectedWeek = ref(1) // Default to week 1
const selectedMonth = ref(new Date().toLocaleDateString('en-CA').slice(0, 7)) // Current month YYYY-MM in local time
const todayStr = new Date().toLocaleDateString('en-CA') // Today in local time
const currentMonthStr = new Date().toLocaleDateString('en-CA').slice(0, 7) // Current month in local time
const selectedWeekDay = ref(new Date().getDay()) // 0=Sun,1=Mon,...6=Sat - default to today

const setFilter = (filter) => {
  activeFilter.value = filter
}

// Get filtered logs and group for display
const filteredLogs = computed(() => {
  const logs = healthStore.logs
  if (!logs.length) return []

  const now = new Date()
  let cutoffDate = new Date()

  if (activeFilter.value === 'day') {
    // Specific date selected
    cutoffDate = new Date(selectedDate.value)
    cutoffDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(cutoffDate)
    nextDay.setDate(nextDay.getDate() + 1)
    return logs.filter(l => {
      const d = new Date(l.logged_at)
      return d >= cutoffDate && d < nextDay
    })
  } else if (activeFilter.value === 'week') {
    // Week view - select day of week (0=Sun, 1=Mon, ... 6=Sat)
    // Show last 7 occurrences of that day
    const targetDay = selectedWeekDay.value
    const now = new Date()
    const result = []

    // Find the most recent 7 occurrences of the target day
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(now)
      checkDate.setDate(checkDate.getDate() - i)
      if (checkDate.getDay() === targetDay) {
        const dayStart = new Date(checkDate)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)
        const dayLogs = logs.filter(l => {
          const d = new Date(l.logged_at)
          return d >= dayStart && d < dayEnd
        })
        if (dayLogs.length > 0) {
          result.push(...dayLogs)
          if (result.length >= 7) break
        }
      }
    }
    return result
  } else {
    // Month view - return data for ALL weeks (W1-W4) combined
    const [year, month] = selectedMonth.value.split('-').map(Number)
    const allLogs = []
    for (let w = 1; w <= 4; w++) {
      const startOfWeek = new Date(year, month - 1, (w - 1) * 7 + 1, 0, 0, 0, 0).getTime()
      const endOfWeek = new Date(year, month - 1, w * 7 + 1, 0, 0, 0, 0).getTime()
      const weekLogs = logs.filter(l => {
        const d = new Date(l.logged_at).getTime()
        return d >= startOfWeek && d < endOfWeek
      })
      allLogs.push(...weekLogs)
    }
    return allLogs
  }
})

// Group data by time period for chart labels
const chartLabels = computed(() => {
  const logs = filteredLogs.value
  if (!logs.length) return []

  if (activeFilter.value === 'day') {
    // Group by hour for day view
    const hours = {}
    logs.forEach(l => {
      const d = new Date(l.logged_at)
      const hour = d.getHours()
      if (!hours[hour]) hours[hour] = []
      hours[hour].push(l)
    })
    return Object.keys(hours).sort((a, b) => a - b).map(h => {
      const avgHR = Math.round(hours[h].reduce((sum, l) => sum + (l.heart_rate || 0), 0) / hours[h].length)
      return { label: `${h}:00`, value: avgHR }
    })
  } else if (activeFilter.value === 'week') {
    // Week view - show last 7 occurrences of selected day, grouped by hour
    const logs = filteredLogs.value
    const hours = {}
    logs.forEach(l => {
      const d = new Date(l.logged_at)
      const hour = d.getHours()
      if (!hours[hour]) hours[hour] = []
      hours[hour].push(l)
    })
    return Object.keys(hours).sort((a, b) => a - b).map(h => {
      const avgHR = Math.round(hours[h].reduce((sum, l) => sum + (l.heart_rate || 0), 0) / hours[h].length)
      return { label: `${h}:00`, value: avgHR }
    })
  } else {
    // Month view - show all 4 weeks
    return [
      { label: 'W1', value: 0 },
      { label: 'W2', value: 0 },
      { label: 'W3', value: 0 },
      { label: 'W4', value: 0 }
    ]
  }
})

// Chart data with proper grouping
const heartRateData = computed(() => {
  const logs = filteredLogs.value
  if (!logs.length) return []

  if (activeFilter.value === 'day') {
    const hours = {}
    logs.forEach(l => {
      const d = new Date(l.logged_at)
      const hour = d.getHours()
      if (!hours[hour]) hours[hour] = []
      hours[hour].push(l.heart_rate)
    })
    return Object.keys(hours).sort((a, b) => a - b).map(h => {
      const vals = hours[h].filter(Boolean)
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
    })
  } else if (activeFilter.value === 'week') {
    // Week view - show last 7 occurrences of selected day, grouped by hour
    const logs = filteredLogs.value
    const hours = {}
    logs.forEach(l => {
      const d = new Date(l.logged_at)
      const hour = d.getHours()
      if (!hours[hour]) hours[hour] = []
      hours[hour].push(l.heart_rate)
    })
    return Object.keys(hours).sort((a, b) => a - b).map(h => {
      const vals = hours[h].filter(Boolean)
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
    })
  } else {
    // Month view - use first 4 data points from filteredLogs as sample
    const data = filteredLogs.value.slice(0, 4).map(l => l.heart_rate)
    // Fill with defaults if not enough data
    while (data.length < 4) data.push(null)
    return data
  }
})

const movementData = computed(() => {
  const logs = filteredLogs.value
  if (!logs.length) return []

  if (activeFilter.value === 'day') {
    const hours = {}
    logs.forEach(l => {
      const d = new Date(l.logged_at)
      const hour = d.getHours()
      if (!hours[hour]) hours[hour] = []
      hours[hour].push(l.baby_movement)
    })
    return Object.keys(hours).sort((a, b) => a - b).map(h => {
      const vals = hours[h].filter(v => v != null)
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
    })
  } else if (activeFilter.value === 'week') {
    // Week view - show last 7 occurrences of selected day, grouped by hour
    const hours = {}
    logs.forEach(l => {
      const d = new Date(l.logged_at)
      const hour = d.getHours()
      if (!hours[hour]) hours[hour] = []
      hours[hour].push(l.baby_movement)
    })
    return Object.keys(hours).sort((a, b) => a - b).map(h => {
      const vals = hours[h].filter(v => v != null)
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
    })
  } else {
    // Month view - use first 4 data points from filteredLogs as sample
    const data = filteredLogs.value.slice(0, 4).map(l => l.baby_movement)
    while (data.length < 4) data.push(null)
    return data
  }
})

const temperatureData = computed(() => {
  const logs = filteredLogs.value
  if (!logs.length) return []

  if (activeFilter.value === 'day') {
    const hours = {}
    logs.forEach(l => {
      const d = new Date(l.logged_at)
      const hour = d.getHours()
      if (!hours[hour]) hours[hour] = []
      hours[hour].push(l.temperature)
    })
    return Object.keys(hours).sort((a, b) => a - b).map(h => {
      const vals = hours[h].filter(Boolean)
      return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null
    })
  } else if (activeFilter.value === 'week') {
    // Week view - show last 7 occurrences of selected day, grouped by hour
    const hours = {}
    logs.forEach(l => {
      const d = new Date(l.logged_at)
      const hour = d.getHours()
      if (!hours[hour]) hours[hour] = []
      hours[hour].push(l.temperature)
    })
    return Object.keys(hours).sort((a, b) => a - b).map(h => {
      const vals = hours[h].filter(Boolean)
      return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null
    })
  } else {
    // Month view - use first 4 data points from filteredLogs as sample
    const data = filteredLogs.value.slice(0, 4).map(l => l.temperature)
    while (data.length < 4) data.push(null)
    return data
  }
})

const maxHR = 180
const minHR = 60
const maxMov = 20
const maxTemp = 40
const minTemp = 35

const graphHeight = 120
const graphPadding = 10

// Generate SVG path for a line
const makeLinePath = (data, max, min) => {
  if (!data.length) return ''
  const width = 270
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
  const width = 270
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

// Data points for rendering circles on chart
const makeDataPoints = (data, max, min) => {
  if (!data.length) return []
  const width = 270
  const stepX = (width - graphPadding * 2) / (data.length - 1)
  return data.map((val, i) => ({
    x: graphPadding + i * stepX,
    y: graphHeight - graphPadding - ((val - min) / (max - min)) * (graphHeight - graphPadding * 2),
    val
  }))
}

const heartRatePoints = computed(() => makeDataPoints(heartRateData.value, maxHR, minHR))
const movementPoints = computed(() => makeDataPoints(movementData.value, maxMov, 0))
const temperaturePoints = computed(() => makeDataPoints(temperatureData.value, maxTemp, minTemp))

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
</script>

<template>
  <div class="health-report-view">
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
        :key="f.key"
        class="filter-btn"
        :class="{ active: activeFilter === f.key }"
        @click="setFilter(f.key)"
      >
        {{ f.label }}
      </button>
    </section>

    <!-- Date/Week Selector -->
    <section class="selector-section">
      <!-- Day selector - allow future dates -->
      <div v-if="activeFilter === 'day'" class="selector-row">
        <input type="date" v-model="selectedDate" class="date-input" :max="todayStr" />
      </div>

      <!-- Week selector - select day of week -->
      <div v-if="activeFilter === 'week'" class="selector-row">
        <button
          v-for="(day, idx) in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']"
          :key="idx"
          class="day-btn"
          :class="{ active: selectedWeekDay === idx }"
          @click="selectedWeekDay = idx"
        >{{ day }}</button>
      </div>

      <!-- Month selector - select month then week 1-4 -->
      <div v-if="activeFilter === 'month'" class="selector-row month-selector">
        <input type="month" v-model="selectedMonth" class="month-input" :max="currentMonthStr" />
        <div class="week-buttons">
          <button
            v-for="w in [1,2,3,4]"
            :key="w"
            class="week-btn"
            :class="{ active: selectedWeek === w }"
            @click="selectedWeek = w"
          >W{{ w }}</button>
        </div>
      </div>
    </section>

    <!-- X-Axis Labels -->
    <div class="chart-labels">
      <span v-for="(label, idx) in chartLabels" :key="idx" class="chart-label">{{ label.label }}</span>
    </div>

    <!-- Heart Rate Chart -->
    <section class="card chart-card">
      <div class="chart-header">
        <span class="chart-title"><IconHeart :size="14" color="#d9534f" /> Heart Rate</span>
        <span class="chart-unit">bpm</span>
      </div>
      <div class="chart-svg-wrapper">
        <svg viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hrGradR" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#d9534f" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#d9534f" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line x1="10" y1="20" x2="270" y2="20" stroke="#fcdcdb" stroke-width="1"/>
          <line x1="10" y1="45" x2="270" y2="45" stroke="#fcdcdb" stroke-width="1"/>
          <line x1="10" y1="70" x2="270" y2="70" stroke="#fcdcdb" stroke-width="1"/>
          <line x1="10" y1="95" x2="270" y2="95" stroke="#fcdcdb" stroke-width="1"/>
          <!-- Y-axis labels -->
          <text x="2" y="24" font-size="7" fill="#aaa">180</text>
          <text x="2" y="49" font-size="7" fill="#aaa">150</text>
          <text x="2" y="74" font-size="7" fill="#aaa">120</text>
          <text x="2" y="99" font-size="7" fill="#aaa">90</text>
          <!-- Area fill -->
          <path :d="hrAreaPath" fill="url(#hrGradR)" opacity="0.4"/>
          <!-- Main line -->
          <path :d="hrLinePath" fill="none" stroke="#d9534f" stroke-width="2" stroke-linecap="round"/>
          <!-- Data points -->
          <circle v-for="(pt, i) in heartRatePoints" :key="'hr'+i" :cx="pt.x" :cy="pt.y" r="3" fill="#d9534f"/>
          <!-- Current value badge -->
          <rect x="235" y="5" width="35" height="18" rx="8" fill="#d9534f"/>
          <text x="252" y="17" font-size="9" fill="white" font-weight="bold" text-anchor="middle">{{ heartRateData[heartRateData.length-1] || '--' }}</text>
        </svg>
      </div>
    </section>

    <!-- Baby Movement Chart -->
    <section class="card chart-card">
      <div class="chart-header">
        <span class="chart-title"><IconBaby :size="14" color="#2b5c8f" /> Baby Movement</span>
        <span class="chart-unit">times</span>
      </div>
      <div class="chart-svg-wrapper" style="background:#f0f7ff;border-color:#d6e2f9">
        <svg viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="movGradR" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#2b5c8f" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#2b5c8f" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line x1="10" y1="20" x2="270" y2="20" stroke="#d6e2f9" stroke-width="1"/>
          <line x1="10" y1="45" x2="270" y2="45" stroke="#d6e2f9" stroke-width="1"/>
          <line x1="10" y1="70" x2="270" y2="70" stroke="#d6e2f9" stroke-width="1"/>
          <line x1="10" y1="95" x2="270" y2="95" stroke="#d6e2f9" stroke-width="1"/>
          <!-- Y-axis labels -->
          <text x="2" y="24" font-size="7" fill="#aaa">20</text>
          <text x="2" y="49" font-size="7" fill="#aaa">15</text>
          <text x="2" y="74" font-size="7" fill="#aaa">10</text>
          <text x="2" y="99" font-size="7" fill="#aaa">5</text>
          <!-- Area fill -->
          <path :d="movAreaPath" fill="url(#movGradR)" opacity="0.4"/>
          <!-- Main line -->
          <path :d="movLinePath" fill="none" stroke="#2b5c8f" stroke-width="2" stroke-linecap="round"/>
          <!-- Data points -->
          <circle v-for="(pt, i) in movementPoints" :key="'mov'+i" :cx="pt.x" :cy="pt.y" r="3" fill="#2b5c8f"/>
          <!-- Current value badge -->
          <rect x="235" y="5" width="35" height="18" rx="8" fill="#2b5c8f"/>
          <text x="252" y="17" font-size="9" fill="white" font-weight="bold" text-anchor="middle">{{ movementData[movementData.length-1] || '--' }}</text>
        </svg>
      </div>
    </section>

    <!-- Temperature Chart -->
    <section class="card chart-card">
      <div class="chart-header">
        <span class="chart-title"><IconTemperature :size="14" color="#e26d5c" /> Temperature</span>
        <span class="chart-unit">°C</span>
      </div>
      <div class="chart-svg-wrapper" style="background:#fff8f5;border-color:#fde0cc">
        <svg viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="tempGradR" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f4ad73" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#f4ad73" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line x1="10" y1="20" x2="270" y2="20" stroke="#fde0cc" stroke-width="1"/>
          <line x1="10" y1="45" x2="270" y2="45" stroke="#fde0cc" stroke-width="1"/>
          <line x1="10" y1="70" x2="270" y2="70" stroke="#fde0cc" stroke-width="1"/>
          <line x1="10" y1="95" x2="270" y2="95" stroke="#fde0cc" stroke-width="1"/>
          <!-- Y-axis labels -->
          <text x="2" y="24" font-size="7" fill="#aaa">40</text>
          <text x="2" y="49" font-size="7" fill="#aaa">37</text>
          <text x="2" y="74" font-size="7" fill="#aaa">35</text>
          <text x="2" y="99" font-size="7" fill="#aaa">33</text>
          <!-- Area fill -->
          <path :d="tempAreaPath" fill="url(#tempGradR)" opacity="0.4"/>
          <!-- Main line -->
          <path :d="tempLinePath" fill="none" stroke="#e26d5c" stroke-width="2" stroke-linecap="round"/>
          <!-- Data points -->
          <circle v-for="(pt, i) in temperaturePoints" :key="'temp'+i" :cx="pt.x" :cy="pt.y" r="3" fill="#e26d5c"/>
          <!-- Current value badge -->
          <rect x="235" y="5" width="35" height="18" rx="8" fill="#e26d5c"/>
          <text x="252" y="17" font-size="9" fill="white" font-weight="bold" text-anchor="middle">{{ temperatureData[temperatureData.length-1] || '--' }}°</text>
        </svg>
      </div>
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
        <button class="report-btn btn-download" @click="downloadPDF"><IconDownload :size="14" /><span>Download PDF</span></button>
        <button class="report-btn btn-share" @click="openShareModal"><IconShare :size="14" /><span>Share to Doctor</span></button>
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
  </div>
</template>

<style scoped>
.health-report-view {
  background-color: #fcf8f2;
  width: 100%;
  min-height: 100vh;
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

/* Selector Section */
.selector-section {
  margin-top: -8px;
}
.selector-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.selector-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: white;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}
.selector-btn.active {
  background: #449284;
  color: white;
  border-color: #449284;
}
.date-input, .month-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 13px;
  background: white;
  color: #333;
}
.month-selector {
  flex-direction: column;
}
.week-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.week-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 11px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
}
.week-btn.active {
  background: #2b5c8f;
  color: white;
  border-color: #2b5c8f;
}
.day-btn {
  flex: 1;
  padding: 8px 4px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 11px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
}
.day-btn.active {
  background: #449284;
  color: white;
  border-color: #449284;
}
.week-hint {
  font-size: 12px;
  color: #888;
  padding: 8px;
}

/* Chart Labels */
.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
  margin-top: -8px;
  margin-bottom: 8px;
}
.chart-label {
  font-size: 10px;
  color: #888;
  text-align: center;
  min-width: 30px;
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

/* Chart with full details like MonitorView */
.chart-svg-wrapper {
  position: relative;
  background: #fff8f8;
  border: 1px solid #fcdcdb;
  border-radius: 12px;
  height: 120px;
  overflow: hidden;
}
.chart-svg-wrapper svg {
  width: 100%;
  height: 100%;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
</style>
