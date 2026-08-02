<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useDeviceStore } from '@/stores/devices'
import { useHealthStore } from '@/stores/health'
import IconBack from '@/components/icons/IconBack.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconWave from '@/components/icons/IconWave.vue'
import IconHospital from '@/components/icons/IconHospital.vue'
import IconBluetooth from '@/components/icons/IconBluetooth.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import IconLogout from '@/components/icons/IconLogout.vue'

const router = useRouter()
const userStore = useUserStore()
const deviceStore = useDeviceStore()
const healthStore = useHealthStore()

const isEditing = ref(false)
const editForm = ref({})

const goBack = () => router.push('/')

onMounted(async () => {
  // Set fallback user immediately so UI never shows "Loading..."
  if (!userStore.user) {
    userStore.user = {
      id: 1,
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
  }

  // Fetch in background, but don't wait - show fallback first
  userStore.fetchUser().catch(() => {})

  // Load devices from localStorage FIRST before anything else
  const savedDevices = localStorage.getItem('momlink_demo_devices')
  const savedActive = localStorage.getItem('momlink_demo_active')

  if (savedDevices) {
    try {
      const parsed = JSON.parse(savedDevices)
      if (parsed.length > 0) {
        deviceStore.devices = parsed
        deviceStore.activeDevice = parsed.find(d => d.id == savedActive) || parsed[0] || null
      }
    } catch (e) {}
  }

  // Fetch user in background
  userStore.fetchUser().catch(() => {})

  // NEVER call fetchDevices here - it will overwrite local data
  // Only use API data if we don't have local data
  if (deviceStore.devices.length === 0) {
    deviceStore.fetchDevices().catch(() => {})
  }
})

const startEdit = () => {
  if (!userStore.user) return
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

const exportData = async () => {
  await healthStore.fetchLogs(500)
  showExportModal.value = true
}

const showExportModal = ref(false)

const downloadCSV = () => {
  const logs = healthStore.logs
  const headers = ['Date/Time', 'Heart Rate', 'Temperature', 'Baby Movement', 'Stress Level']
  const rows = logs.map(l => [
    l.logged_at ? new Date(l.logged_at).toLocaleString() : '',
    l.heart_rate || '',
    l.temperature || '',
    l.baby_movement || '',
    l.stress_level || ''
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `momlink-health-data-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showExportModal.value = false
}
</script>

<template>
  <div class="profile-view">
    <!-- Top Nav -->
    <header class="app-header">
      <button class="back-btn" @click="goBack"><IconBack :size="18" /></button>
      <h1>Profile</h1>
      <button class="edit-btn" @click="startEdit"><IconEdit :size="16" /></button>
    </header>

    <!-- User Bio Card -->
    <section class="card user-bio-card">
      <div class="user-avatar"><IconWave :size="40" /></div>
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
          <span class="hospital-icon"><IconHospital :size="28" /></span>
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
            <span class="device-icon"><IconBluetooth :size="24" /></span>
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
      <button class="export-btn" @click="exportData"><IconDownload :size="16" /> Export Data</button>
    </section>

    <!-- Export Data Modal -->
    <div v-if="showExportModal" class="export-modal-overlay" @click="showExportModal = false">
      <div class="export-modal" @click.stop>
        <div class="modal-header">
          <h3>Export Health Data</h3>
          <button class="close-btn" @click="showExportModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Your health data ({{ healthStore.logs.length }} records)</p>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Heart Rate</th>
                  <th>Temp</th>
                  <th>Movement</th>
                  <th>Stress</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in healthStore.logs.slice(0, 50)" :key="log.id">
                  <td>{{ log.logged_at ? new Date(log.logged_at).toLocaleString() : '-' }}</td>
                  <td>{{ log.heart_rate || '-' }}</td>
                  <td>{{ log.temperature || '-' }}</td>
                  <td>{{ log.baby_movement || '-' }}</td>
                  <td>{{ log.stress_level || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="healthStore.logs.length > 50" class="more-data">... and {{ healthStore.logs.length - 50 }} more records</p>
          <button class="download-csv-btn" @click="downloadCSV">
            <IconDownload :size="16" /> Download CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Account Actions -->
    <section class="card account-card">
      <button class="account-btn btn-logout"><IconLogout :size="16" /> Logout</button>
    </section>
  </div>
</template>

<style scoped>
.profile-view {
  background-color: #fcf8f2;
  width: 100%;
  min-height: 100vh;
  height: auto;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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

/* Export Modal */
.export-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.export-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  max-height: 70vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}
.modal-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #888;
}
.modal-body {
  padding: 16px;
}
.modal-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}
.data-table {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
}
.data-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.data-table th {
  background: #449284;
  color: white;
  padding: 8px 6px;
  text-align: left;
  position: sticky;
  top: 0;
}
.data-table td {
  padding: 8px 6px;
  border-bottom: 1px solid #eee;
}
.data-table tr:nth-child(even) {
  background: #f9f9f9;
}
.more-data {
  font-size: 11px;
  color: #888;
  text-align: center;
  margin-bottom: 12px;
}
.download-csv-btn {
  width: 100%;
  background: #449284;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.account-btn { width: 100%; background: none; border: none; padding: 14px; font-size: 14px; font-weight: 500; color: #333; cursor: pointer; border-radius: 12px; text-align: left; }
.btn-logout { color: #d9534f; }
</style>
