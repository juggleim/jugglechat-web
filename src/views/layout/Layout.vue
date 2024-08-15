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

let state = reactive({
  isMax: getMax()
});

function setWin(type){
  if(utils.isEqual(type, 'maximize')){
    state.isMax = true;
  }
  if(utils.isEqual(type, 'unmaximize')){
    state.isMax = false;
  }
  JuggleIMDesktop.setWindow({ type });
}

async function getMax(){
  let isMax = false;
  if(typeof JuggleIMDesktop != 'undefined'){
    isMax = await JuggleIMDesktop.isMaximized();;
  }
  return isMax;
}

</script>

<template>
  <div class="tyn-desktop-header" v-if="juggle.isDesktop() && !utils.isMacBrowser()">
    <ul class="tyn-desktop-navs" v-if="!utils.isMacBrowser()">
      <li class="tyn-desktop-nav">
        <a class="wr wr-win-hide" @click="setWin('hide')"></a>
      </li>
      <li class="tyn-desktop-nav" v-if="state.isMax">
        <a class="wr wr-win-min" @click="setWin('unmaximize')"></a>
      </li>
      <li class="tyn-desktop-nav" v-else>
        <a class="wr wr-win-max" @click="setWin('maximize')"></a>
      </li>
      <li class="tyn-desktop-nav">
        <a class="wr wr-win-close" @click="setWin('close')"></a>
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
