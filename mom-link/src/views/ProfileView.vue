<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useDeviceStore } from '@/stores/devices'
import { useHealthStore } from '@/stores/health'

const router = useRouter()
const userStore = useUserStore()
const deviceStore = useDeviceStore()
const healthStore = useHealthStore()

const isEditing = ref(false)
const editForm = ref({})

const goBack = () => router.push('/')

onMounted(async () => {
  await Promise.all([
    userStore.fetchUser(),
    deviceStore.fetchDevices(),
  ])
})

const startEdit = () => {
  editForm.value = { ...userStore.user }
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editForm.value = {}
}

const saveProfile = async () => {
  try {
    await userStore.updateProfile(editForm.value)
    isEditing.value = false
  } catch (err) {
    alert('Failed to save: ' + err.message)
  }
}

const exportData = () => {
  const url = healthStore.getExportUrl()
  window.open(url, '_blank')
}

const scrollContainer = ref(null)
let isDown = false
let startY, scrollTop

const handleMouseDown = (e) => {
  isDown = true
  scrollContainer.value?.classList.add('active-drag')
  startY = e.pageY - scrollContainer.value?.offsetTop
  scrollTop = scrollContainer.value?.scrollTop
}
const handleMouseLeave = () => { isDown = false; scrollContainer.value?.classList.remove('active-drag') }
const handleMouseUp = () => { isDown = false; scrollContainer.value?.classList.remove('active-drag') }
const handleMouseMove = (e) => {
  if (!isDown) return
  e.preventDefault()
  const y = e.pageY - scrollContainer.value?.offsetTop
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
      <button class="edit-btn" @click="startEdit">✏️</button>
    </header>

    <!-- User Bio Card -->
    <section class="card user-bio-card">
      <div class="user-avatar">👩‍🍼</div>
      <div class="user-info">
        <h2 class="user-name">{{ userStore.user?.name || 'Loading...' }}</h2>
        <p class="user-sub">Week {{ userStore.user?.pregnancy_week || '-'}} Pregnancy</p>
      </div>
    </section>

    <!-- Personal Info / Edit Form -->
    <section class="card info-card">
      <h3>Personal Information</h3>

      <template v-if="!isEditing">
        <div class="info-grid">
          <div class="info-row"><span class="info-label">Age</span><span class="info-value">{{ userStore.user?.age || '-' }} years old</span></div>
          <div class="info-row"><span class="info-label">Pregnancy Week</span><span class="info-value">Week {{ userStore.user?.pregnancy_week || '-' }}</span></div>
          <div class="info-row"><span class="info-label">Due Date</span><span class="info-value">{{ userStore.user?.due_date || '-' }}</span></div>
          <div class="info-row"><span class="info-label">Blood Type</span><span class="info-value">{{ userStore.user?.blood_type || '-' }}</span></div>
          <div class="info-row"><span class="info-label">Allergies</span><span class="info-value">{{ userStore.user?.allergies || '-' }}</span></div>
        </div>
      </template>

      <template v-else>
        <div class="edit-form">
          <label class="form-label"><span>Name</span><input v-model="editForm.name" type="text" /></label>
          <label class="form-label"><span>Age</span><input v-model="editForm.age" type="number" /></label>
          <label class="form-label"><span>Pregnancy Week</span><input v-model="editForm.pregnancy_week" type="number" /></label>
          <label class="form-label"><span>Due Date</span><input v-model="editForm.due_date" type="date" /></label>
          <label class="form-label"><span>Blood Type</span><input v-model="editForm.blood_type" type="text" /></label>
          <label class="form-label"><span>Allergies</span><input v-model="editForm.allergies" type="text" /></label>
          <div class="edit-actions">
            <button class="btn-cancel" @click="cancelEdit">Cancel</button>
            <button class="btn-save" @click="saveProfile" :disabled="userStore.loading">Save</button>
          </div>
        </div>
      </template>
    </section>

    <!-- Hospital Info -->
    <section class="card hospital-card">
      <h3>Hospital Information</h3>
      <template v-if="!isEditing">
        <div class="hospital-row">
          <span class="hospital-icon">🏥</span>
          <div class="hospital-info">
            <span class="hospital-name">{{ userStore.user?.hospital || '-' }}</span>
            <span class="doctor-name">{{ userStore.user?.doctor || '-' }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="edit-form">
          <label class="form-label"><span>Hospital</span><input v-model="editForm.hospital" type="text" /></label>
          <label class="form-label"><span>Doctor</span><input v-model="editForm.doctor" type="text" /></label>
        </div>
      </template>
    </section>

    <!-- Device Management -->
    <section class="card device-card" @click="router.push('/bluetooth')">
      <h3>Bluetooth Devices</h3>
      <div v-if="deviceStore.devices.length" class="device-list">
        <div v-for="device in deviceStore.devices" :key="device.id" class="device-item">
          <div class="device-left">
            <span class="device-icon">🌀</span>
            <div class="device-info">
              <span class="device-name">{{ device.name }}</span>
              <span class="device-type">{{ device.device_type }}</span>
            </div>
          </div>
          <span v-if="device.is_active" class="device-status connected">Active</span>
        </div>
      </div>
      <p v-else class="no-device">No devices paired. Tap to add.</p>
      <button class="device-link-btn">Manage Devices →</button>
    </section>

    <!-- Export Data -->
    <section class="card export-card">
      <h3>Export Health Data</h3>
      <p class="export-desc">Download your health logs as CSV</p>
      <button class="export-btn" @click="exportData">📥 Export Data</button>
    </section>

    <!-- Account Actions -->
    <section class="card account-card">
      <button class="account-btn btn-logout">🚪 Logout</button>
    </section>

    <!-- Bottom Nav-->
    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')"><span class="nav-icon">🏠</span><span class="nav-label">Home</span></button>
      <button class="nav-item" @click="router.push('/monitor')"><span class="nav-icon">📈</span><span class="nav-label">Monitor</span></button>
      <button class="nav-item" @click="router.push('/ai-analysis')"><span class="nav-icon">😊</span><span class="nav-label">AI Analysis</span></button>
      <button class="nav-item active"><span class="nav-icon">👤</span><span class="nav-label">Profile</span></button>
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
.back-btn, .edit-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #333; }
.app-header h1 { font-size: 16px; font-weight: bold; }

.card { background: white; border-radius: 20px; padding: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.01); }
.card h3 { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px; }

.user-bio-card { display: flex; align-items: center; gap: 16px; }
.user-avatar { font-size: 48px; }
.user-name { font-size: 18px; font-weight: bold; color: #1a1a1a; }
.user-sub { font-size: 13px; color: #555; margin-top: 4px; }

.info-grid { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; justify-content: space-between; font-size: 13px; }
.info-label { color: #888; }
.info-value { font-weight: 500; color: #333; }

.edit-form { display: flex; flex-direction: column; gap: 8px; }
.form-label { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.form-label span { color: #888; }
.form-label input { border: 1px solid #ddd; border-radius: 8px; padding: 6px 10px; font-size: 13px; width: 60%; }
.edit-actions { display: flex; gap: 10px; margin-top: 10px; justify-content: flex-end; }
.btn-cancel, .btn-save { border: none; border-radius: 10px; padding: 8px 16px; font-size: 13px; font-weight: bold; cursor: pointer; }
.btn-cancel { background: #eee; color: #666; }
.btn-save { background: #449284; color: white; }
.btn-save:disabled { opacity: 0.6; }

.hospital-row { display: flex; align-items: center; gap: 12px; }
.hospital-icon { font-size: 28px; }
.hospital-name { display: block; font-size: 14px; font-weight: bold; color: #333; }
.doctor-name { display: block; font-size: 12px; color: #888; margin-top: 2px; }

.device-card { cursor: pointer; }
.device-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
.device-item { display: flex; justify-content: space-between; align-items: center; }
.device-left { display: flex; align-items: center; gap: 10px; }
.device-icon { font-size: 24px; }
.device-name { display: block; font-size: 13px; font-weight: bold; color: #333; }
.device-type { display: block; font-size: 11px; color: #888; }
.device-status { font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 12px; }
.device-status.connected { background: #d1ebd9; color: #2e6b5e; }
.no-device { font-size: 13px; color: #888; text-align: center; padding: 10px; }
.device-link-btn { width: 100%; background: #f0f7ff; border: none; border-radius: 10px; padding: 10px; font-size: 13px; font-weight: bold; color: #2b5c8f; cursor: pointer; margin-top: 8px; }

.export-card { text-align: center; }
.export-desc { font-size: 12px; color: #888; margin-bottom: 10px; }
.export-btn { background: #449284; color: white; border: none; border-radius: 12px; padding: 12px 24px; font-size: 14px; font-weight: bold; cursor: pointer; }

.account-btn { width: 100%; background: none; border: none; padding: 14px; font-size: 14px; font-weight: 500; color: #333; cursor: pointer; border-radius: 12px; text-align: left; }
.btn-logout { color: #d9534f; }

.bottom-nav {
  position: absolute; bottom: 0; left: 0; width: 100%;
  background-color: #ffffff; display: flex; justify-content: space-around;
  padding: 12px 0 24px 0; border-top: 1px solid #f0eae1;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04); z-index: 100;
}
.nav-item { background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #888; cursor: pointer; }
.nav-item.active { color: #449284; }
.nav-icon { font-size: 18px; }
.nav-label { font-size: 10px; font-weight: 500; }
</style>
