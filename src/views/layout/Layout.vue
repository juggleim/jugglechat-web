<script setup>
import JHeader from '../header/header.vue';
import WinHeader from '../../components/win-header.vue';
import JFooter from '../../components/footer.vue';
import im from "../../common/im";
import utils from '../../common/utils';

let juggle = im.getCurrent();

</script>

<template>
  <WinHeader></WinHeader>
  <!--  -->
  <div class="tyn-root" :class="{ 'tyn-desktop-root': juggle.isDesktop() && !utils.isMacBrowser(), 'tyn-web-root': !juggle.isDesktop() }">
    <JHeader />
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" />
    </RouterView>
  </div>
  <JFooter></JFooter>
</template>
