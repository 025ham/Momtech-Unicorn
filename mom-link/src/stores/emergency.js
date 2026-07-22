import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useEmergencyStore = defineStore('emergency', () => {
  // Try to load from localStorage
  const savedContacts = localStorage.getItem('momlink_contacts')

  const defaultContacts = [
    { name: 'Emergency Services', number: '1669', type: 'emergency' },
    { name: 'Husband - John', number: '081-234-5678', type: 'personal' },
    { name: 'Dr. Maria Chen', number: '089-123-4567', type: 'doctor' },
  ]

  const emergencyContacts = ref(savedContacts ? JSON.parse(savedContacts) : defaultContacts)

  // Save to localStorage
  const saveContacts = () => {
    localStorage.setItem('momlink_contacts', JSON.stringify(emergencyContacts.value))
  }

  // Add new contact
  const addContact = (contact) => {
    emergencyContacts.value.push(contact)
    saveContacts()
  }

  // Remove contact
  const removeContact = (index) => {
    emergencyContacts.value.splice(index, 1)
    saveContacts()
  }

  // Update contact
  const updateContact = (index, data) => {
    emergencyContacts.value[index] = { ...emergencyContacts.value[index], ...data }
    saveContacts()
  }

  return {
    emergencyContacts,
    addContact,
    removeContact,
    updateContact,
  }
})
