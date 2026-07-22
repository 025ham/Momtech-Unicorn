<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useHealthStore } from '@/stores/health'

const router = useRouter()
const userStore = useUserStore()
const healthStore = useHealthStore()

const goBack = () => {
  router.push('/')
}

const deviceInfo = ref({
  patchId: 'MLK-2024-8847',
  battery: 92,
  lastSync: '2 min ago',
  status: 'Connected',
})

const scrollContainer = ref(null)
let isDown = false
let startY, scrollTop

const handleMouseDown = (e) => {
  isDown = true
  scrollContainer.value.classList.add('active-drag')
  startY = e.pageY - scrollContainer.value.offsetTop
  scrollTop = scrollContainer.value.scrollTop
}
const handleMouseLeave = () => { isDown = false; scrollContainer.value.classList.remove('active-drag') }
const handleMouseUp = () => { isDown = false; scrollContainer.value.classList.remove('active-drag') }
const handleMouseMove = (e) => {
  if (!isDown) return
  e.preventDefault()
  const y = e.pageY - scrollContainer.value.offsetTop
  const walk = (y - startY) * 1.5
  scrollContainer.value.scrollTop = scrollTop - walk
}
</script>

<template>
  <div
    class="profile-view"
    ref="scrollContainer"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseLeave"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <!-- Top Nav -->
    <header class="app-header">
      <button class="back-btn" @click="goBack">❮</button>
      <h1>Profile</h1>
      <button class="edit-btn">✏️</button>
    </header>

    <!-- User Bio Card -->
    <section class="card user-bio-card">
      <div class="user-avatar">👩‍🍼</div>
      <div class="user-info">
        <h2 class="user-name">{{ userStore.user.name }}</h2>
        <p class="user-sub">Week {{ userStore.user.pregnancyWeek }} Pregnancy</p>
      </div>
    </section>

    <!-- Personal Info -->
    <section class="card info-card">
      <h3>Personal Information</h3>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Age</span>
          <span class="info-value">{{ userStore.user.age }} years old</span>
        </div>
        <div class="info-row">
          <span class="info-label">Pregnancy Week</span>
          <span class="info-value">Week {{ userStore.user.pregnancyWeek }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Due Date</span>
          <span class="info-value">{{ userStore.user.dueDate }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Blood Type</span>
          <span class="info-value">{{ userStore.user.bloodType }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Allergies</span>
          <span class="info-value">{{ userStore.user.allergies }}</span>
        </div>
      </div>
    </section>

    <!-- Hospital Info -->
    <section class="card hospital-card">
      <h3>Hospital Information</h3>
      <div class="hospital-row">
        <span class="hospital-icon">🏥</span>
        <div class="hospital-info">
          <span class="hospital-name">{{ userStore.user.hospital }}</span>
          <span class="doctor-name">{{ userStore.user.doctor }}</span>
        </div>
      </div>
    </section>

    <!-- Device Management -->
    <section class="card device-card">
      <h3>Device Management</h3>
      <div class="device-item">
        <div class="device-left">
          <span class="device-icon">🌀</span>
          <div class="device-info">
            <span class="device-name">Momentum Patch</span>
            <span class="device-id">{{ deviceInfo.patchId }}</span>
          </div>
        </div>
        <span class="device-status connected">{{ deviceInfo.status }}</span>
      </div>
      <div class="device-stats">
        <div class="stat-item">
          <span class="stat-icon">🔋</span>
          <span class="stat-value">{{ deviceInfo.battery }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🕐</span>
          <span class="stat-value">{{ deviceInfo.lastSync }}</span>
        </div>
      </div>
      <div class="device-actions">
        <button class="device-btn btn-sync">Sync Now</button>
        <button class="device-btn btn-unpair">Unpair Device</button>
      </div>
    </section>

    <!-- Account Actions -->
    <section class="card account-card">
      <button class="account-btn">✏️ Edit Profile</button>
      <button class="account-btn btn-logout">🚪 Logout</button>
    </section>

    <!-- Bottom Nav-->
    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item" @click="router.push('/monitor')">
        <span class="nav-icon">📈</span>
        <span class="nav-label">Monitor</span>
      </button>
      <button class="nav-item" @click="router.push('/ai-analysis')">
        <span class="nav-icon">😊</span>
        <span class="nav-label">AI Analysis</span>
      </button>
      <button class="nav-item active">
        <span class="nav-icon">👤</span>
        <span class="nav-label">Profile</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.profile-view {
  background-color: #fcf8f2;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 110px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: grab;
  user-select: none;
}
.profile-view.active-drag { cursor: grabbing; }
.profile-view::-webkit-scrollbar { display: none; }

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
.back-btn, .edit-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #333;
}
.app-header h1 {
  font-size: 16px;
  font-weight: bold;
}

/* Card Base */
.card {
  background: white;
  border-radius: 20px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.01);
}
.card h3 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

/* User Bio */
.user-bio-card {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-avatar {
  font-size: 48px;
}
.user-name {
  font-size: 18px;
  font-weight: bold;
  color: #1a1a1a;
}
.user-sub {
  font-size: 13px;
  color: #555;
  margin-top: 4px;
}

/* Info Grid */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.info-label { color: #888; }
.info-value { font-weight: 500; color: #333; }

/* Hospital */
.hospital-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hospital-icon { font-size: 28px; }
.hospital-name {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.doctor-name {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

/* Device */
.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.device-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.device-icon { font-size: 24px; }
.device-name {
  display: block;
  font-size: 13px;
  font-weight: bold;
  color: #333;
}
.device-id {
  display: block;
  font-size: 11px;
  color: #888;
}
.device-status {
  font-size: 11px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 12px;
}
.device-status.connected {
  background: #d1ebd9;
  color: #2e6b5e;
}

.device-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.stat-icon { font-size: 14px; }
.stat-value { font-size: 12px; font-weight: 500; color: #333; }

.device-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.device-btn {
  border: none;
  border-radius: 12px;
  padding: 10px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}
.btn-sync { background: #d6e2f9; color: #2b5c8f; }
.btn-unpair { background: #fcdcdb; color: #d9534f; }

/* Account */
.account-btn {
  width: 100%;
  background: none;
  border: none;
  padding: 14px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  border-radius: 12px;
  text-align: left;
}
.account-btn:hover { background: #f9f9f9; }
.btn-logout { color: #d9534f; }

/* Bottom Nav */
.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 24px 0;
  border-top: 1px solid #f0eae1;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
  z-index: 100;
}
.nav-item {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #888;
  cursor: pointer;
}
.nav-item.active { color: #449284; }
.nav-icon { font-size: 18px; }
.nav-label { font-size: 10px; font-weight: 500; }
</style>
