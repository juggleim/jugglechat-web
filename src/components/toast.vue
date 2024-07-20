<script setup>
const props = defineProps(['icon', 'title', 'text']);
</script>

<template>
  <div class="toaster">
      <div class="toast fade show jg-toast-box">
        <div class="jg-toast-icon wr" :class="'wr-'+props.icon"></div>
        <div class="jg-toast-content">
          <div class="jg-toast-title">{{ props.title }}</div>
          <div class="jg-toast-text">{{ props.text }}</div>
        </div>
      </div>
    </div>
</template>
