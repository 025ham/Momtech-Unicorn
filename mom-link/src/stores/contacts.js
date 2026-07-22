import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/index.js'
import { useUserStore } from './user.js'

export const useContactStore = defineStore('contacts', () => {
  const contacts = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchContacts = async () => {
    const userStore = useUserStore()
    loading.value = true
    error.value = null
    try {
      const data = await api.getContacts(userStore.user?.id || userStore.DEMO_USER_ID)
      contacts.value = data
    } catch (err) {
      error.value = err.message
      contacts.value = [
        { id: 1, name: 'Emergency Services', phone: '1669', contact_type: 'emergency' },
        { id: 2, name: 'John (Husband)', phone: '081-234-5678', contact_type: 'personal' },
        { id: 3, name: 'Dr. Maria Chen', phone: '089-123-4567', contact_type: 'doctor' },
      ]
    } finally {
      loading.value = false
    }
  }

  const addContact = async (data) => {
    const userStore = useUserStore()
    try {
      const result = await api.addContact({
        user_id: userStore.user?.id || userStore.DEMO_USER_ID,
        ...data,
      })
      contacts.value.push(result)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateContact = async (id, data) => {
    try {
      await api.updateContact(id, data)
      const idx = contacts.value.findIndex(c => c.id === id)
      if (idx !== -1) contacts.value[idx] = { ...contacts.value[idx], ...data }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteContact = async (id) => {
    try {
      await api.deleteContact(id)
      contacts.value = contacts.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return { contacts, loading, error, fetchContacts, addContact, updateContact, deleteContact }
})
