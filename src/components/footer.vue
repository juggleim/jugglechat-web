<script setup>
import im from "../common/im";
let juggle = im.getCurrent();
</script>

<template>
  <div class="tyn-footer" v-if="!juggle.isDesktop()">
    Copyright © 2025  JuggleIM <a href="https://beian.miit.gov.cn/" target="_blank"></a>
  </div>
</template>
