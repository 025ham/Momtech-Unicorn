import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/index.js'
import { useUserStore } from './user.js'
import { useDeviceStore } from './devices.js'

export const useHealthStore = defineStore('health', () => {
  const logs = ref([])
  const latest = ref(null)
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Real-time simulation state - shared across all views
  const isSimulating = ref(false)
  let simInterval = null
  const simHeartRate = ref(140)
  const simMovement = ref(8)
  const simTemperature = ref(36.5)

  const isEmergencyDevice = () => {
    const deviceStore = useDeviceStore()
    return deviceStore.activeDevice?.name?.includes('Emergency') ||
           deviceStore.activeDevice?.is_emergency
  }

  const fetchLogs = async (limit = 100) => {
    const userStore = useUserStore()
    loading.value = true
    error.value = null
    try {
      const data = await api.getHealthLogs(userStore.user?.id || userStore.DEMO_USER_ID, limit)
      logs.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Start real-time simulation - updates latest every 2 seconds
  const startSimulation = () => {
    if (simInterval) return // already running

    isSimulating.value = true

    // Initialize with base values
    if (!latest.value) {
      latest.value = {
        heart_rate: simHeartRate.value,
        temperature: simTemperature.value,
        baby_movement: simMovement.value,
        stress_level: 'Normal',
        logged_at: new Date().toISOString(),
      }
    }

    simInterval = setInterval(() => {
      const isEmergency = isEmergencyDevice()

      if (isEmergency) {
        // Emergency device: all values are abnormally high
        const hrChange = Math.floor(Math.random() * 20) - 5 // -5 to +14
        simHeartRate.value = Math.max(170, Math.min(200, simHeartRate.value + hrChange))

        if (Math.random() < 0.3) {
          const tempChange = parseFloat((Math.random() * 0.4 - 0.1).toFixed(1))
          simTemperature.value = parseFloat((Math.max(37.8, Math.min(39.0, simTemperature.value + tempChange))).toFixed(1))
        }
        // Emergency: baby movement stays very low
        if (Math.random() < 0.2) {
          simMovement.value = Math.max(0, Math.min(3, simMovement.value - 1))
        }

        latest.value = {
          heart_rate: simHeartRate.value,
          temperature: simTemperature.value,
          baby_movement: simMovement.value,
          stress_level: 'High',
          logged_at: new Date().toISOString(),
        }
      } else {
        // Normal device: realistic values
        const hrChange = Math.floor(Math.random() * 10) - 5 // -5 to +4
        simHeartRate.value = Math.max(120, Math.min(160, simHeartRate.value + hrChange))

        // Baby movement and temperature change less frequently (every ~10 seconds)
        if (Math.random() < 0.3) { // 30% chance each tick
          const movChange = Math.floor(Math.random() * 3) - 1 // -1 to +1
          simMovement.value = Math.max(3, Math.min(18, simMovement.value + movChange))
        }
        if (Math.random() < 0.3) { // 30% chance each tick
          const tempChange = parseFloat((Math.random() * 0.3 - 0.15).toFixed(1))
          simTemperature.value = parseFloat((Math.max(36.0, Math.min(37.5, simTemperature.value + tempChange))).toFixed(1))
        }

        latest.value = {
          heart_rate: simHeartRate.value,
          temperature: simTemperature.value,
          baby_movement: simMovement.value,
          stress_level: simMovement.value < 6 ? 'Medium' : 'Normal',
          logged_at: new Date().toISOString(),
        }
      }
    }, 2000)
  }

  const stopSimulation = () => {
    if (simInterval) {
      clearInterval(simInterval)
      simInterval = null
    }
    isSimulating.value = false
  }

  const fetchLatest = async () => {
    const userStore = useUserStore()
    try {
      latest.value = await api.getLatestHealth(userStore.user?.id || userStore.DEMO_USER_ID)
    } catch (err) {
      // Generate random values based on device type
      if (isEmergencyDevice()) {
        latest.value = {
          heart_rate: Math.floor(Math.random() * 30) + 170,
          temperature: parseFloat((37.8 + Math.random() * 1.2).toFixed(1)),
          baby_movement: Math.floor(Math.random() * 3),
          stress_level: 'High',
          logged_at: new Date().toISOString(),
        }
      } else {
        latest.value = {
          heart_rate: Math.floor(Math.random() * 30) + 65,
          temperature: parseFloat((36.0 + Math.random() * 1.5).toFixed(1)),
          baby_movement: Math.floor(Math.random() * 15) + 3,
          stress_level: ['Low', 'Normal', 'Medium'][Math.floor(Math.random() * 3)],
          logged_at: new Date().toISOString(),
        }
      }
    }
  }

  const fetchStats = async () => {
    const userStore = useUserStore()
    try {
      stats.value = await api.getHealthStats(userStore.user?.id || userStore.DEMO_USER_ID)
    } catch (err) {
      if (isEmergencyDevice()) {
        stats.value = {
          avg_heart_rate: Math.floor(Math.random() * 30) + 170,
          avg_temperature: parseFloat((37.8 + Math.random() * 1.2).toFixed(1)),
          avg_baby_movement: Math.floor(Math.random() * 3),
          total_logs: Math.floor(Math.random() * 50) + 50,
        }
      } else {
        stats.value = {
          avg_heart_rate: Math.floor(Math.random() * 20) + 65,
          avg_temperature: parseFloat((36.2 + Math.random() * 0.8).toFixed(1)),
          avg_baby_movement: Math.floor(Math.random() * 10) + 4,
          total_logs: Math.floor(Math.random() * 50) + 50,
        }
      }
    }
  }

  const addLog = async (data) => {
    const userStore = useUserStore()
    try {
      const result = await api.addHealthLog({
        user_id: userStore.user?.id || userStore.DEMO_USER_ID,
        ...data,
      })
      logs.value.unshift(result)
      latest.value = result
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getExportUrl = () => {
    const userStore = useUserStore()
    return api.exportHealthLogs(userStore.user?.id || userStore.DEMO_USER_ID, 'csv')
  }

  return {
    logs, latest, stats, loading, error,
    isSimulating,
    fetchLogs, fetchLatest, fetchStats, addLog, getExportUrl,
    startSimulation, stopSimulation
  }
})