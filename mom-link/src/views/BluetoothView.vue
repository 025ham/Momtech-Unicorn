<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDeviceStore } from '@/stores/devices'
import { useHealthStore } from '@/stores/health'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const deviceStore = useDeviceStore()
const healthStore = useHealthStore()
const userStore = useUserStore()

const showAddForm = ref(false)
const newDevice = ref({ name: '', device_type: '', mac_address: '' })
const isScanning = ref(false)
const showEmergencyAlert = ref(false)

onMounted(async () => {
  await userStore.fetchUser()
  await deviceStore.fetchDevices()
})

const goBack = () => router.push('/profile')

const selectDevice = async (id) => {
  try {
    await deviceStore.setActive(id)
    // Check if selected device is emergency device
    const device = deviceStore.devices.find(d => d.id === id)
    if (device?.name?.includes('Emergency')) {
      showEmergencyAlert.value = true
      // Stay until user dismisses
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
  try {
    await deviceStore.deleteDevice(id)
  } catch (err) {
    alert('Failed: ' + err.message)
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
  name: '⚠️ Emergency Test Device',
  device_type: 'heart_rate_monitor',
  mac_address: '00:00:00:00:00:EMERGENCY',
  is_emergency: true
}

const addDemoDevice = async (demo) => {
  try {
    const device = await deviceStore.addDevice({
      name: demo.name,
      device_type: demo.device_type,
      mac_address: demo.mac_address,
    })

    // Add mockup health log history for this device (ALL metrics in one device)
    const now = Date.now()
    for (let i = 0; i < 20; i++) {
      const loggedAt = new Date(now - i * 3600000 * 4).toISOString() // every 4 hours
      const data = {
        device_id: device.id,
        heart_rate: Math.floor(Math.random() * 20) + 65,  // 65-85 bpm
        temperature: parseFloat((36.2 + Math.random() * 0.8).toFixed(1)), // 36.2-37.0 °C
        baby_movement: Math.floor(Math.random() * 10) + 5, // 5-15 times
        stress_level: ['Low', 'Normal', 'Low', 'Low'][Math.floor(Math.random() * 4)],
        logged_at: loggedAt,
      }
      await healthStore.addLog(data)
    }

    // Refresh devices list
    await deviceStore.fetchDevices()
  } catch (err) {
    alert('Failed to add device: ' + err.message)
  }
}

// Add emergency test device with ABNORMAL values
const addEmergencyDevice = async () => {
  try {
    const device = await deviceStore.addDevice({
      name: emergencyDevice.name,
      device_type: emergencyDevice.device_type,
      mac_address: emergencyDevice.mac_address,
    })

    // Add ABNORMAL health log history
    const now = Date.now()
    for (let i = 0; i < 20; i++) {
      const loggedAt = new Date(now - i * 3600000 * 4).toISOString()
      // ABNORMAL values: very high heart rate, high temperature, low baby movement
      const data = {
        device_id: device.id,
        heart_rate: Math.floor(Math.random() * 30) + 170,  // 170-200 bpm (DANGER!)
        temperature: parseFloat((37.8 + Math.random() * 1.2).toFixed(1)), // 37.8-39.0°C (FEVER!)
        baby_movement: Math.floor(Math.random() * 3), // 0-2 times (LOW!)
        stress_level: ['High', 'Very High', 'High'][Math.floor(Math.random() * 3)],
        logged_at: loggedAt,
      }
      await healthStore.addLog(data)
    }

    // Refresh devices list
    await deviceStore.fetchDevices()
  } catch (err) {
    alert('Failed to add device: ' + err.message)
  }
}

const getDeviceIcon = (type) => {
  const icons = {
    heart_rate_monitor: '❤️',
    temperature_sensor: '🌡️',
    movement_sensor: '👶',
    default: '🌀'
  }
  return icons[type] || icons.default
}

const scrollContainer = ref(null)
let isDown = false, startY, scrollTop

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
  scrollContainer.value.scrollTop = scrollTop - (y - startY) * 1.5
}
</script>

<template>
  <div
    class="bluetooth-view"
    ref="scrollContainer"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseLeave"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <!-- Emergency Alert Overlay -->
    <div v-if="showEmergencyAlert" class="emergency-overlay">
      <div class="emergency-alert-box">
        <div class="emergency-icon">🚨</div>
        <div class="emergency-text">DANGER!</div>
        <div class="emergency-sub">Abnormal Vital Signs Detected</div>
        <div class="emergency-values">
          <div class="emergency-value danger">❤️ HR: 170-200 bpm</div>
          <div class="emergency-value warning">🌡️ Temp: 37.8-39°C</div>
          <div class="emergency-value warning">👶 Movement: 0-2</div>
        </div>
        <button class="emergency-action-btn" @click="router.push('/emergency')">
          🚨 Go to Emergency
        </button>
        <button class="emergency-dismiss-btn" @click="showEmergencyAlert = false">
          ✕ Dismiss
        </button>
      </div>
    </div>

    <!-- Header -->
    <header class="app-header">
      <button class="back-btn" @click="goBack">❮</button>
      <h1>Bluetooth Devices</h1>
      <div style="width: 32px"></div>
    </header>

    <!-- Active Device -->
    <section class="card active-device" v-if="deviceStore.activeDevice">
      <h3>Currently Connected</h3>
      <div class="active-info">
        <span class="device-icon-lg">{{ getDeviceIcon(deviceStore.activeDevice.device_type) }}</span>
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
        {{ isScanning ? '🔍 Scanning...' : '🔍 Scan Real Device' }}
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
            {{ getDeviceIcon(demo.device_type) }} {{ demo.name }}
          </button>
          <button class="demo-btn emergency-btn" @click="addEmergencyDevice">
            ⚠️ Emergency Test Device
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
            <span class="device-icon">{{ getDeviceIcon(device.device_type) }}</span>
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
            <button class="delete-btn" @click="deleteDevice(device.id)">🗑️</button>
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
  padding-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: grab;
  user-select: none;
}
.bluetooth-view.active-drag { cursor: grabbing; }
.bluetooth-view::-webkit-scrollbar { display: none; }

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
