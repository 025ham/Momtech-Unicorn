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
      latest.value = {
        heart_rate: 72,
        temperature: 36.8,
        baby_movement: 5,
        stress_level: 'Low',
        logged_at: new Date().toISOString(),
      }
    }
  }

  const fetchStats = async () => {
    const userStore = useUserStore()
    try {
      stats.value = await api.getHealthStats(userStore.user?.id || userStore.DEMO_USER_ID)
    } catch (err) {
      stats.value = {
        avg_heart_rate: 72,
        avg_temperature: 36.6,
        avg_baby_movement: 5,
        total_logs: 100,
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
