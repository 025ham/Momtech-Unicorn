import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/index.js'
import { useUserStore } from './user.js'

export const useHealthStore = defineStore('health', () => {
  const logs = ref([])
  const latest = ref(null)
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Check if active device is emergency (lazy import to avoid circular dependency)
  const isEmergencyDevice = () => {
    try {
      const { useDeviceStore } = require('./devices.js')
      const deviceStore = useDeviceStore()
      return deviceStore.activeDevice?.name?.includes('Emergency') ||
             deviceStore.activeDevice?.is_emergency
    } catch (e) {
      return false
    }
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

  const fetchLatest = async () => {
    const userStore = useUserStore()
    try {
      latest.value = await api.getLatestHealth(userStore.user?.id || userStore.DEMO_USER_ID)
    } catch (err) {
      // Check if active device is emergency
      if (isEmergencyDevice()) {
        // Emergency device: ABNORMAL values
        latest.value = {
          heart_rate: Math.floor(Math.random() * 30) + 170,  // 170-200 bpm (dangerous)
          temperature: parseFloat((37.8 + Math.random() * 1.2).toFixed(1)), // 37.8-39°C
          baby_movement: Math.floor(Math.random() * 3), // 0-2 times (low)
          stress_level: 'High',
          logged_at: new Date().toISOString(),
        }
      } else {
        // Normal device: random normal values
        latest.value = {
          heart_rate: Math.floor(Math.random() * 30) + 65,  // 65-95 bpm
          temperature: parseFloat((36.0 + Math.random() * 1.5).toFixed(1)), // 36.0-37.5 °C
          baby_movement: Math.floor(Math.random() * 15) + 3, // 3-18 times
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
        // Emergency device: ABNORMAL stats
        stats.value = {
          avg_heart_rate: Math.floor(Math.random() * 30) + 170,
          avg_temperature: parseFloat((37.8 + Math.random() * 1.2).toFixed(1)),
          avg_baby_movement: Math.floor(Math.random() * 3),
          total_logs: Math.floor(Math.random() * 50) + 50,
        }
      } else {
        // Normal device: random normal stats
        stats.value = {
          avg_heart_rate: Math.floor(Math.random() * 20) + 65,  // 65-85 bpm
          avg_temperature: parseFloat((36.2 + Math.random() * 0.8).toFixed(1)),
          avg_baby_movement: Math.floor(Math.random() * 10) + 4, // 4-14 times
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

  return { logs, latest, stats, loading, error, fetchLogs, fetchLatest, fetchStats, addLog, getExportUrl }
})
