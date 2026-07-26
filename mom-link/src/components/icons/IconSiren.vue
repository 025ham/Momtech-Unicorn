<!-- Siren / Emergency icon (red) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L13.5 7.5H18L14.5 10.5L16 15L12 12L8 15L9.5 10.5L6 7.5H10.5L12 3Z" fill="#FF5A5A"/>
    <path d="M5 17H19L18 21H6L5 17Z" fill="#FF5A5A"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#FF5A5A' }
})
</script>
