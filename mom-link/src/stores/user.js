import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/index.js'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Demo user ID (เอาไว้ใช้ก่อนมี auth)
  const DEMO_USER_ID = 1

  const fetchUser = async (id = DEMO_USER_ID) => {
    loading.value = true
    error.value = null
    try {
      const data = await api.getUser(id)
      user.value = data
    } catch (err) {
      error.value = err.message
      // fallback user
      user.value = {
        id: DEMO_USER_ID,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        age: 28,
        pregnancy_week: 28,
        due_date: '2024-10-15',
        hospital: 'Bangkok Hospital',
        doctor: 'Dr. Maria Chen',
        blood_type: 'O+',
        allergies: 'None',
      }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data) => {
    loading.value = true
    error.value = null
    try {
      await api.updateUser(user.value.id, data)
      user.value = { ...user.value, ...data }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const data = await api.login({ email, password })
      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (data) => {
    loading.value = true
    error.value = null
    try {
      const result = await api.register(data)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { user, loading, error, fetchUser, updateProfile, login, register, DEMO_USER_ID }
})
