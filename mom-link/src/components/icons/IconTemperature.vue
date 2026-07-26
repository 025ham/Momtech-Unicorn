<!-- Temperature icon (thermometer) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="2" width="8" height="14" rx="4" fill="#FF9254"/>
    <circle cx="12" cy="18" r="5" fill="#FF6230"/>
    <circle cx="12" cy="18" r="2.5" fill="white"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: 'currentColor' }
})
</script>
