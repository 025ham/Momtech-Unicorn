<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDeviceStore } from '@/stores/devices'
import { useHealthStore } from '@/stores/health'
import { useUserStore } from '@/stores/user'
import IconBack from '@/components/icons/IconBack.vue'
import IconBluetooth from '@/components/icons/IconBluetooth.vue'
import IconHeart from '@/components/icons/IconHeart.vue'
import IconTemperature from '@/components/icons/IconTemperature.vue'
import IconBaby from '@/components/icons/IconBaby.vue'
import IconWarning from '@/components/icons/IconWarning.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconSiren from '@/components/icons/IconSiren.vue'

const router = useRouter()
const deviceStore = useDeviceStore()
const healthStore = useHealthStore()
const userStore = useUserStore()

const showAddForm = ref(false)
const newDevice = ref({ name: '', device_type: '', mac_address: '' })
const isScanning = ref(false)
const showEmergencyAlert = ref(false)

// Save devices to localStorage for demo persistence
const saveDevicesToStorage = () => {
  localStorage.setItem('momlink_demo_devices', JSON.stringify(deviceStore.devices))
  localStorage.setItem('momlink_demo_active', deviceStore.activeDevice?.id || null)
}

// Load devices from localStorage on mount
const loadDevicesFromStorage = () => {
  const saved = localStorage.getItem('momlink_demo_devices')
  if (saved) {
    try {
      const devices = JSON.parse(saved)
      if (devices.length > 0) {
        deviceStore.devices = devices
        const activeId = localStorage.getItem('momlink_demo_active')
        deviceStore.activeDevice = devices.find(d => d.id == activeId) || devices[0]
      }
    } catch (e) {
      console.log('Failed to load devices from storage')
    }
  }
}

onMounted(async () => {
  await userStore.fetchUser()
  // Init demo devices (loads from storage if available, otherwise creates new demo devices)
  initDemoDevices()
})

const goBack = () => router.push('/profile')

const selectDevice = async (id) => {
  try {
    // Update local state directly
    deviceStore.devices.forEach(d => d.is_active = d.id === id ? 1 : 0)
    deviceStore.activeDevice = deviceStore.devices.find(d => d.id === id)

    // Save selection to localStorage
    saveDevicesToStorage()

    // Also update on server (may fail silently)
    try {
      await deviceStore.setActive(id)
    } catch (e) {
      // Ignore API errors for demo
    }

    // Check if selected device is emergency device
    const device = deviceStore.devices.find(d => d.id === id)
    if (device?.name?.includes('Emergency')) {
      showEmergencyAlert.value = true
    }
  } catch (err) {
    alert('Failed: ' + err.message)
  }
}

const addDevice = async () => {
  if (!newDevice.value.name || !newDevice.value.device_type) {
    alert('Name and type are required')
    return
  }
  // Check if device with same mac_address already exists
  if (newDevice.value.mac_address && deviceStore.devices.some(d => d.mac_address === newDevice.value.mac_address)) {
    alert('Device already added!')
    return
  }
  try {
    await deviceStore.addDevice(newDevice.value)
    showAddForm.value = false
    newDevice.value = { name: '', device_type: '', mac_address: '' }
  } catch (err) {
    alert('Failed to add device: ' + err.message)
  }
}

const deleteDevice = async (id) => {
  if (!confirm('Remove this device?')) return
  // Delete locally first for demo (even if API fails)
  const idx = deviceStore.devices.findIndex(d => d.id === id)
  if (idx !== -1) {
    deviceStore.devices.splice(idx, 1)
  }
  if (deviceStore.activeDevice?.id === id) {
    deviceStore.activeDevice = deviceStore.devices[0] || null
  }
  // Save to localStorage
  saveDevicesToStorage()
  // Also try API delete (may fail silently)
  try {
    await deviceStore.deleteDevice(id)
  } catch (err) {
    console.log('API delete failed, removed locally')
  }
}

const scanBluetooth = async () => {
  if (!navigator.bluetooth) {
    alert('Bluetooth not supported in this browser')
    return
  }
  isScanning.value = true
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['heart_rate', 'health_thermometer', 'user_data']
    })
    newDevice.value.name = device.name || 'Unknown Device'
    newDevice.value.mac_address = device.id
    showAddForm.value = true
  } catch (err) {
    console.log('Scan cancelled or failed:', err)
  } finally {
    isScanning.value = false
  }
}

// Demo devices with mockup health data (normal)
const demoDevices = [
  { name: 'Heart Rate Monitor Pro', device_type: 'heart_rate_monitor', mac_address: '00:11:22:33:44:55' },
  { name: 'Temp Sensor Mini', device_type: 'temperature_sensor', mac_address: '00:11:22:33:44:56' },
  { name: 'Baby Movement Detector', device_type: 'movement_sensor', mac_address: '00:11:22:33:44:57' },
]

// Emergency test device with ABNORMAL values
const emergencyDevice = {
  name: 'Emergency Test Device',
  device_type: 'heart_rate_monitor',
  mac_address: '00:00:00:00:00:EMERGENCY',
  is_emergency: true
}

// Initialize with demo devices if none exist
const initDemoDevices = () => {
  // Check from localStorage first - if has data, don't init again
  const saved = localStorage.getItem('momlink_demo_devices')
  if (saved) {
    try {
      const devices = JSON.parse(saved)
      if (devices.length > 0) {
        deviceStore.devices = devices
        const activeId = localStorage.getItem('momlink_demo_active')
        deviceStore.activeDevice = devices.find(d => d.id == activeId) || devices[0]
        return // has data, no need to init
      }
    } catch (e) {}
  }

  // No saved data, init demo devices
  if (deviceStore.devices.length === 0) {
    const initialDevices = [
      { name: 'Heart Rate Monitor Pro', device_type: 'heart_rate_monitor', mac_address: '00:11:22:33:44:55' },
      { name: 'Temp Sensor Mini', device_type: 'temperature_sensor', mac_address: '00:11:22:33:44:56' },
      { name: 'Baby Movement Detector', device_type: 'movement_sensor', mac_address: '00:11:22:33:44:57' },
    ]
    initialDevices.forEach((demo, idx) => {
      deviceStore.devices.push({
        id: Date.now() + idx,
        name: demo.name,
        device_type: demo.device_type,
        mac_address: demo.mac_address,
        is_active: idx === 0 ? 1 : 0,
        is_emergency: false,
      })
    })
    deviceStore.activeDevice = deviceStore.devices[0]
    // Save immediately after init
    localStorage.setItem('momlink_demo_devices', JSON.stringify(deviceStore.devices))
    localStorage.setItem('momlink_demo_active', deviceStore.activeDevice?.id || null)
  }
}

const addDemoDevice = async (demo) => {
  // Check if device already exists
  if (deviceStore.devices.some(d => d.mac_address === demo.mac_address)) {
    alert('Device already added!')
    return
  }
  try {
    // Add directly to local state for demo (bypass API for testing)
    const newDevice = {
      id: Date.now(),
      name: demo.name,
      device_type: demo.device_type,
      mac_address: demo.mac_address,
      is_active: deviceStore.devices.length === 0 ? 1 : 0,
      is_emergency: demo.is_emergency || false,
    }
    deviceStore.devices.push(newDevice)
    if (!deviceStore.activeDevice) {
      deviceStore.activeDevice = newDevice
    }

    // Save to localStorage for persistence
    saveDevicesToStorage()

    // Add mockup health log history for this device (ALL metrics in one device)
    const now = Date.now()
    for (let i = 0; i < 20; i++) {
      const loggedAt = new Date(now - i * 3600000 * 4).toISOString()
      const data = {
        device_id: newDevice.id,
        heart_rate: Math.floor(Math.random() * 20) + 65,  // 65-85 bpm
        temperature: parseFloat((36.2 + Math.random() * 0.8).toFixed(1)),
        baby_movement: Math.floor(Math.random() * 10) + 5,
        stress_level: ['Low', 'Normal', 'Low', 'Low'][Math.floor(Math.random() * 4)],
        logged_at: loggedAt,
      }
      healthStore.logs.unshift({ ...data, id: Date.now() + i })
    }
  } catch (err) {
    alert('Failed to add device: ' + err.message)
  }
}

// Add emergency test device with ABNORMAL values
const addEmergencyDevice = async () => {
  // Check if emergency device already exists
  if (deviceStore.devices.some(d => d.mac_address === emergencyDevice.mac_address)) {
    alert('Emergency device already added!')
    return
  }
  try {
    // Add directly to local state for demo (bypass API for testing)
    // DON'T set is_active here - user must explicitly select it
    const newDevice = {
      id: Date.now(),
      name: emergencyDevice.name,
      device_type: emergencyDevice.device_type,
      mac_address: emergencyDevice.mac_address,
      is_active: 0, // NOT active yet - user must select
      is_emergency: true,
    }
    deviceStore.devices.push(newDevice)
    // Don't set activeDevice here - user must select

    // Save to localStorage
    localStorage.setItem('momlink_demo_devices', JSON.stringify(deviceStore.devices))
    localStorage.setItem('momlink_demo_active', null) // no device active yet

  } catch (err) {
    alert('Failed to add device: ' + err.message)
  }
}
</script>

<template>
  <div class="bluetooth-view">
    <!-- Emergency Alert Overlay -->
    <div v-if="showEmergencyAlert" class="emergency-overlay">
      <div class="emergency-alert-box">
        <div class="emergency-icon"><IconSiren :size="80" color="white" /></div>
        <div class="emergency-text">DANGER!</div>
        <div class="emergency-sub">Abnormal Vital Signs Detected</div>
        <div class="emergency-values">
          <div class="emergency-value danger"><IconHeart :size="16" color="#ffcccc" /> HR: 170-200 bpm</div>
          <div class="emergency-value warning"><IconTemperature :size="16" color="#ffddcc" /> Temp: 37.8-39°C</div>
          <div class="emergency-value warning"><IconBaby :size="16" color="#ffddcc" /> Movement: 0-2</div>
        </div>
        <button class="emergency-action-btn" @click="router.push('/emergency')">
          <IconWarning :size="18" color="#d9534f" /> Go to Emergency
        </button>
        <button class="emergency-dismiss-btn" @click="showEmergencyAlert = false">
          <IconClose :size="14" color="white" /> Dismiss
        </button>
      </div>
    </div>

    <!-- Header -->
    <header class="app-header">
      <button class="back-btn" @click="goBack"><IconBack :size="16" /></button>
      <h1>Bluetooth Devices</h1>
      <div style="width: 32px"></div>
    </header>

    <!-- Active Device -->
    <section class="card active-device" v-if="deviceStore.activeDevice">
      <h3>Currently Connected</h3>
      <div class="active-info">
        <span class="device-icon-lg"><IconBluetooth :size="40" /></span>
        <div class="device-details">
          <span class="device-name">{{ deviceStore.activeDevice.name }}</span>
          <span class="device-type-label">{{ deviceStore.activeDevice.device_type }}</span>
        </div>
        <span class="active-badge">Active</span>
      </div>
    </section>

    <!-- Scan Button -->
    <section class="card scan-section">
      <button class="scan-btn" @click="scanBluetooth" :disabled="isScanning">
        <IconBluetooth :size="16" color="white" /> {{ isScanning ? 'Scanning...' : 'Scan Real Device' }}
      </button>
      <p class="or-divider">— or —</p>
      <div class="demo-devices">
        <p class="demo-label">Quick Demo:</p>
        <div class="demo-btns">
          <button
            v-for="demo in demoDevices"
            :key="demo.mac_address"
            class="demo-btn"
            @click="addDemoDevice(demo)"
          >
            <IconBluetooth :size="14" /> {{ demo.name }}
          </button>
          <button class="demo-btn emergency-btn" @click="addEmergencyDevice">
            <IconWarning :size="14" color="#d9534f" /> Emergency Test Device
          </button>
        </div>
      </div>
    </section>

    <!-- All Devices -->
    <section class="card devices-list">
      <h3>All Devices</h3>
      <div v-if="deviceStore.devices.length">
        <div
          v-for="device in deviceStore.devices"
          :key="device.id"
          class="device-item"
          :class="{ active: device.is_active }"
        >
          <div class="device-left">
            <span class="device-icon"><IconBluetooth :size="24" /></span>
            <div class="device-info">
              <span class="device-name">{{ device.name }}</span>
              <span class="device-type">{{ device.device_type }}</span>
            </div>
          </div>
          <div class="device-actions">
            <button
              v-if="!device.is_active"
              class="select-btn"
              @click="selectDevice(device.id)"
            >Select</button>
            <button class="delete-btn" @click="deleteDevice(device.id)"><IconTrash :size="14" /></button>
          </div>
        </div>
      </div>
      <p v-else class="no-devices">No devices found. Tap scan to search.</p>
    </section>

    <!-- Add Device Form -->
    <section v-if="showAddForm" class="card add-form">
      <h3>Add Device</h3>
      <label class="form-label">
        <span>Name</span>
        <input v-model="newDevice.name" type="text" placeholder="Device name" />
      </label>
      <label class="form-label">
        <span>Type</span>
        <select v-model="newDevice.device_type">
          <option value="">Select type...</option>
          <option value="heart_rate_monitor">Heart Rate Monitor</option>
          <option value="temperature_sensor">Temperature Sensor</option>
          <option value="movement_sensor">Movement Sensor</option>
        </select>
      </label>
      <label class="form-label">
        <span>MAC Address</span>
        <input v-model="newDevice.mac_address" type="text" placeholder="Optional" />
      </label>
      <div class="form-actions">
        <button class="btn-cancel" @click="showAddForm = false">Cancel</button>
        <button class="btn-add" @click="addDevice">Add Device</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bluetooth-view {
  background-color: #fcf8f2;
  width: 100%;
  height: 100%;
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
.back-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #333; }
.app-header h1 { font-size: 16px; font-weight: bold; }

.card { background: white; border-radius: 20px; padding: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.01); }
.card h3 { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px; }

.active-device { background: linear-gradient(135deg, #d1ebd9, #f0f7ff); }
.active-info { display: flex; align-items: center; gap: 12px; }
.device-icon-lg { font-size: 40px; }
.device-details { flex: 1; }
.device-name { display: block; font-size: 16px; font-weight: bold; color: #333; }
.device-type-label { font-size: 12px; color: #666; }
.active-badge { background: #449284; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }

.scan-section { text-align: center; }
.scan-btn { background: #2b5c8f; color: white; border: none; border-radius: 12px; padding: 14px 24px; font-size: 14px; font-weight: bold; cursor: pointer; width: 100%; }
.scan-btn:disabled { opacity: 0.7; }
.or-divider { text-align: center; color: #888; font-size: 12px; margin: 12px 0 8px; }
.demo-devices { text-align: center; }
.demo-label { font-size: 12px; color: #888; margin-bottom: 8px; }
.demo-btns { display: flex; flex-direction: column; gap: 8px; }
.demo-btn { background: #f0f7ff; border: 1px solid #d6e2f9; border-radius: 10px; padding: 10px 16px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.demo-btn:hover { background: #d6e2f9; }
.emergency-btn { background: #fcdcdb !important; border-color: #d9534f !important; color: #d9534f !important; font-weight: bold; }
.emergency-btn:hover { background: #f5c6c5 !important; }

.devices-list { display: flex; flex-direction: column; gap: 10px; }
.device-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-radius: 12px; background: #f9f9f9; }
.device-item.active { background: #d1ebd9; }
.device-left { display: flex; align-items: center; gap: 10px; }
.device-icon { font-size: 24px; }
.device-name { display: block; font-size: 13px; font-weight: bold; color: #333; }
.device-type { display: block; font-size: 11px; color: #888; }
.device-actions { display: flex; gap: 8px; align-items: center; }
.select-btn { background: #449284; color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: bold; cursor: pointer; }
.delete-btn { background: none; border: none; cursor: pointer; font-size: 16px; }
.no-devices { text-align: center; color: #888; font-size: 13px; padding: 20px; }

.add-form { display: flex; flex-direction: column; gap: 10px; }
.form-label { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.form-label span { color: #888; }
.form-label input, .form-label select { border: 1px solid #ddd; border-radius: 8px; padding: 8px 10px; font-size: 13px; width: 60%; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px; }
.btn-cancel, .btn-add { border: none; border-radius: 10px; padding: 8px 16px; font-size: 13px; font-weight: bold; cursor: pointer; }
.btn-cancel { background: #eee; color: #666; }
.btn-add { background: #449284; color: white; }

/* Emergency Alert Overlay */
.emergency-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(217, 83, 79, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: emergencyPulse 0.5s infinite;
}

@keyframes emergencyPulse {
  0%, 100% { background: rgba(217, 83, 79, 0.98); }
  50% { background: rgba(255, 0, 0, 0.98); }
}

.emergency-alert-box {
  text-align: center;
  color: white;
  padding: 30px;
}

.emergency-icon {
  font-size: 80px;
  animation: bounce 0.3s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.emergency-text {
  font-size: 48px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  margin: 20px 0;
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.emergency-sub {
  font-size: 18px;
  margin-bottom: 20px;
}

.emergency-values {
  background: rgba(0,0,0,0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
}

.emergency-value {
  font-size: 16px;
  font-weight: bold;
  padding: 8px;
  border-radius: 8px;
  margin: 8px 0;
}

.emergency-value.danger { background: rgba(255,255,255,0.3); color: #ffcccc; }
.emergency-value.warning { background: rgba(255,255,255,0.2); color: #ffddcc; }

.emergency-action-btn {
  background: white;
  color: #d9534f;
  border: none;
  border-radius: 50px;
  padding: 18px 40px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  margin-bottom: 15px;
}

.emergency-dismiss-btn {
  background: transparent;
  color: white;
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 25px;
  padding: 10px 30px;
  font-size: 14px;
  cursor: pointer;
}
</style>
