<!-- Document / File icon (mint) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8L14 2Z" fill="#5DC6BA"/>
    <polyline points="14,2 14,8 20,8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="9" y1="13" x2="15" y2="13" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="9" y1="17" x2="13" y2="17" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#5DC6BA' }
})
</script>
