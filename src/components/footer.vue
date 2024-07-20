<script setup>
import im from "../common/im";
let juggle = im.getCurrent();
</script>

<template>
  <div class="tyn-footer" v-if="!juggle.isDesktop()">
    Copyright © 2024  北京追风未来科技有限公司 <a href="https://beian.miit.gov.cn/" target="_blank">京ICP备2023005595号-3</a>
  </div>
</template>
