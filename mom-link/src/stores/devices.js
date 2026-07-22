import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/index.js'
import { useUserStore } from './user.js'

export const useDeviceStore = defineStore('devices', () => {
  const devices = ref([])
  const activeDevice = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchDevices = async () => {
    const userStore = useUserStore()
    loading.value = true
    error.value = null
    try {
      const data = await api.getDevices(userStore.user?.id || userStore.DEMO_USER_ID)
      devices.value = data
      activeDevice.value = data.find(d => d.is_active) || null
    } catch (err) {
      error.value = err.message
      // Mock devices
      devices.value = [
        { id: 1, name: 'Heart Rate Monitor', device_type: 'heart_rate_monitor', is_active: 1 },
        { id: 2, name: 'Temp Sensor', device_type: 'temperature_sensor', is_active: 0 },
      ]
      activeDevice.value = devices.value.find(d => d.is_active) || devices.value[0]
    } finally {
      loading.value = false
    }
  }

  const addDevice = async (data) => {
    const userStore = useUserStore()
    loading.value = true
    try {
      const result = await api.addDevice({ ...data, user_id: userStore.user?.id || userStore.DEMO_USER_ID })
      devices.value.push(result)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const setActive = async (deviceId) => {
    const userStore = useUserStore()
    loading.value = true
    try {
      await api.setActiveDevice(deviceId, userStore.user?.id || userStore.DEMO_USER_ID)
      devices.value.forEach(d => d.is_active = d.id === deviceId ? 1 : 0)
      activeDevice.value = devices.value.find(d => d.id === deviceId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDevice = async (id) => {
    loading.value = true
    try {
      await api.deleteDevice(id)
      devices.value = devices.value.filter(d => d.id !== id)
      if (activeDevice.value?.id === id) {
        activeDevice.value = devices.value[0] || null
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { devices, activeDevice, loading, error, fetchDevices, addDevice, setActive, deleteDevice }
})
