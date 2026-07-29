import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([
    { id: 1, title: 'Remember your checkup tomorrow', time: '2 hours ago', read: false, is_emergency: false },
    { id: 2, title: 'Baby movement detected', time: '5 hours ago', read: true, is_emergency: false },
  ])
  const nextId = ref(3)

  const addNotification = (notification) => {
    const now = new Date()
    const timeStr = 'Just now'
    notifications.value.unshift({
      id: nextId.value++,
      title: notification.title,
      time: timeStr,
      read: false,
      is_emergency: notification.is_emergency || false,
      created_at: now.toISOString(),
    })
  }

  const markAsRead = (id) => {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) notif.read = true
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  const getUnreadCount = () => {
    return notifications.value.filter(n => !n.read).length
  }

  return { notifications, addNotification, markAsRead, markAllAsRead, getUnreadCount }
})