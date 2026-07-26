<!-- Signal / WiFi icon (mint/teal) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12.5C5 12.5 8.5 8 12 8C15.5 8 19 12.5 19 12.5" stroke="#5DC6BA" stroke-width="2" stroke-linecap="round"/>
    <path d="M8.5 15.5C8.5 15.5 10 13 12 13C14 13 15.5 15.5 15.5 15.5" stroke="#5DC6BA" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="18" r="2" fill="#5DC6BA"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#5DC6BA' }
})
</script>
