<!-- Hospital icon (red) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="18" height="15" rx="2" fill="#FF5A5A"/>
    <path d="M12 10V14M10 12H14" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <path d="M7 6V4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V6" stroke="white" stroke-width="1.5"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#FF5A5A' }
})
</script>
