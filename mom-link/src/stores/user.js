import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // Try to load from localStorage
  const savedUser = localStorage.getItem('momlink_user')
  const defaultUser = {
    name: 'Sarah Johnson',
    age: 28,
    pregnancyWeek: 28,
    dueDate: '2024-10-15',
    hospital: 'Bangkok Hospital',
    doctor: 'Dr. Maria Chen',
    bloodType: 'O+',
    allergies: 'None',
  }

  const user = ref(savedUser ? JSON.parse(savedUser) : defaultUser)

  // Persist to localStorage
  const saveUser = () => {
    localStorage.setItem('momlink_user', JSON.stringify(user.value))
  }

  const updateUser = (data) => {
    user.value = { ...user.value, ...data }
    saveUser()
  }

  const resetUser = () => {
    user.value = defaultUser
    saveUser()
  }

  return { user, updateUser, resetUser }
})
