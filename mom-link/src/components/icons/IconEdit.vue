<!-- Edit / Pencil icon (gray) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3L21 8L8 21H3V16L16 3Z" fill="#888"/>
    <line x1="13" y1="6" x2="18" y2="11" stroke="white" stroke-width="2" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#888' }
})
</script>
