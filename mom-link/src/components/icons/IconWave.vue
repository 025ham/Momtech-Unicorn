<!-- Waving hand icon (skin tone) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 5.5C16 5.5 15 4 14 4C13 4 12 5.5 12 5.5" stroke="#FFB59A" stroke-width="2" stroke-linecap="round"/>
    <path d="M10 6.5C10 6.5 9 5 8 5C7 5 6 6.5 6 6.5" stroke="#FFB59A" stroke-width="2" stroke-linecap="round"/>
    <path d="M4 11.5C4 11.5 5 10 6 10C7 10 8 11.5 8 11.5V17C8 17 7 19 5 19C3 19 2 17 2 17V11.5C2 11.5 3 10 4 10C5 10 6 11.5 6 11.5" stroke="#FFB59A" stroke-width="2" stroke-linecap="round"/>
    <path d="M8 11.5V16C8 16 8.5 17 10 17C11.5 17 12 16 12 16V11.5" stroke="#FFB59A" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 11.5V15C12 15 12.5 16 14 16C15.5 16 16 15 16 15V8C16 6.5 15 5 14 5C13 5 12 6 12 6" stroke="#FFB59A" stroke-width="2" stroke-linecap="round"/>
    <path d="M16 8V17C16 17 17 19 19 19C21 19 22 17 22 17V10C22 8.5 21 7 20 7C19 7 18 8 18 8" stroke="#FFB59A" stroke-width="2" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#FFB59A' }
})
</script>
