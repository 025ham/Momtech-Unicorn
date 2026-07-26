<!-- Bluetooth icon (mint/teal) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 7.5L12 4L17.5 7.5V16.5L12 20L6.5 16.5V7.5Z" fill="#5DC6BA"/>
    <path d="M12 4V20" stroke="white" stroke-width="1.5"/>
    <path d="M8 10L12 13L16 10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8 14L12 11L16 14" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#5DC6BA' }
})
</script>
