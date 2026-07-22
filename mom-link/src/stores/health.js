import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useHealthStore = defineStore('health', () => {
  // Try to load from localStorage
  const savedMetrics = localStorage.getItem('momlink_health')

  const defaultMetrics = {
    heartRate: 145,
    heartRateHistory: [120, 135, 128, 142, 138, 145, 140, 148, 143, 147, 144, 146],
    babyMovement: 18,
    movementTarget: 20,
    temperature: 36.8,
    stressLevel: 'Low',
    healthScore: 97,
  }

  const metrics = ref(savedMetrics ? JSON.parse(savedMetrics) : defaultMetrics)

  // Save to localStorage
  const saveMetrics = () => {
    localStorage.setItem('momlink_health', JSON.stringify(metrics.value))
  }

  // Update single metric
  const updateMetric = (key, value) => {
    metrics.value[key] = value
    saveMetrics()
  }

  // Add heart rate to history
  const addHeartRateReading = (value) => {
    metrics.value.heartRateHistory = [
      ...metrics.value.heartRateHistory.slice(1),
      value,
    ]
    metrics.value.heartRate = value
    saveMetrics()
  }

  // Increment baby movement
  const incrementMovement = () => {
    metrics.value.babyMovement++
    saveMetrics()
  }

  // Update health score
  const updateHealthScore = (score) => {
    metrics.value.healthScore = score
    saveMetrics()
  }

  return {
    metrics,
    updateMetric,
    addHeartRateReading,
    incrementMovement,
    updateHealthScore,
  }
})
