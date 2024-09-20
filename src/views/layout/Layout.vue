<script setup>

import WinHeader from '../../components/win-header.vue';
import JFooter from '../../components/footer.vue';
import im from "../../common/im";
import utils from '../../common/utils';

let juggle = im.getCurrent();

</script>

<template>
  <WinHeader></WinHeader>
  <div class="tyn-root" :class="{ 'tyn-desktop-root': juggle.isDesktop(), 'tyn-web-root': !juggle.isDesktop() }">
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" />
    </RouterView>
  </div>
  <JFooter></JFooter>
</template>
