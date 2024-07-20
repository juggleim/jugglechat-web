<script setup>
import JHeader from '../header/header.vue';
import JFooter from '../../components/footer.vue';
import { useRouter } from 'vue-router'
import { reactive } from 'vue'
import im from "../../common/im";
import utils from '../../common/utils';

let juggle = im.getCurrent();
const router = useRouter()
let { currentRoute: { _rawValue: { fullPath } } } = router;
if (fullPath == '/') {
  router.replace({ name: 'ConversationList' })
}

</script>

<template>
  <div class="tyn-desktop-header" v-if="juggle.isDesktop() && !utils.isMacBrowser()">
    <ul class="tyn-desktop-navs">
      <li class="tyn-desktop-nav">
        <a class="wr wr-subtract"></a>
      </li>
      <li class="tyn-desktop-nav">
        <a class="wr wr-fang"></a>
      </li>
      <li class="tyn-desktop-nav">
        <a class="wr wr-close"></a>
      </li>
    </ul>
  </div>
  <!--  -->
  <div class="tyn-root" :class="{ 'tyn-desktop-root': juggle.isDesktop() && !utils.isMacBrowser(), 'tyn-web-root': !juggle.isDesktop() }">
    <JHeader />
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" />
    </RouterView>
  </div>
  <JFooter></JFooter>
</template>
