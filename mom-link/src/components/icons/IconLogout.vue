<!-- Logout / Sign out icon (red) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H9" stroke="#FF5A5A" stroke-width="2" stroke-linecap="round"/>
    <polyline points="16,17 21,12 16,7" stroke="#FF5A5A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="#FF5A5A" stroke-width="2" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#FF5A5A' }
})
</script>
