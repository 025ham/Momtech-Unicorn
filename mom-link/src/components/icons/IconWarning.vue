<!-- Warning / SOS icon (red) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L21.5 19H2.5L12 3Z" fill="#FF5A5A"/>
    <line x1="12" y1="10" x2="12" y2="14.5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="12" cy="17" r="1.2" fill="white"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#FF5A5A' }
})
</script>
