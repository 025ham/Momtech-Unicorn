<!-- Download icon (blue) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4V16M12 16L8 12M12 16L16 12" stroke="#5BA4F5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 17V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V17" stroke="#5BA4F5" stroke-width="2.5" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#5BA4F5' }
})
</script>
