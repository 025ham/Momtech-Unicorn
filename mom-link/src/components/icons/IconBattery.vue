<!-- Battery icon (mint/teal) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="7" width="17" height="10" rx="2" fill="#5DC6BA"/>
    <rect x="19" y="10" width="2" height="4" rx="1" fill="#5DC6BA"/>
    <rect x="5" y="10" width="8" height="4" rx="1" fill="white" fill-opacity="0.5"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#5DC6BA' }
})
</script>
