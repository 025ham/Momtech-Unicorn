<!-- Refresh / Reload icon (mint) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12C4 7.58172 7.58172 4 12 4C15.0736 4 17.7256 5.80151 19 8.4" stroke="#5DC6BA" stroke-width="2" stroke-linecap="round"/>
    <path d="M20 12C20 16.4183 16.4183 20 12 20C8.92638 20 6.27442 18.1985 5 15.6" stroke="#5DC6BA" stroke-width="2" stroke-linecap="round"/>
    <path d="M15 8H19V4" stroke="#5DC6BA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 16H5V20" stroke="#5DC6BA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#5DC6BA' }
})
</script>
