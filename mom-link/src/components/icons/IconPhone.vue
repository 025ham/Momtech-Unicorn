<!-- Phone / Call icon (mint) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92V19.92C22 20.48 21.56 20.96 21 20.99C20.62 21 20.23 21 19.84 21C11.28 21 4 13.72 4 5.16C4 4.77 4 4.38 4.01 4C4.04 3.44 4.52 3 5.08 3H8.08C8.58 3 9 3.42 9 3.92C9 5.16 9.32 6.34 9.89 7.41C10.11 7.78 10.04 8.26 9.72 8.52L7.97 9.77C9.24 12.53 11.47 14.76 14.23 16.03L15.48 14.28C15.74 13.96 16.22 13.89 16.59 14.11C17.66 14.68 18.84 15 20.08 15C20.58 15 21 15.42 21 15.92V16.92Z" fill="#5DC6BA"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#5DC6BA' }
})
</script>
