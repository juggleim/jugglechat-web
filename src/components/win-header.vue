<script setup>
const props = defineProps(['title']);
import { reactive, getCurrentInstance } from "vue";
import utils from '../common/utils';
import im from "../common/im";

let juggle = im.getCurrent();

let state = reactive({
  isMax: false
});

if(typeof JuggleIMDesktop != 'undefined'){
  JuggleIMDesktop.isMaximized().then((isMax) => {
    state.isMax = isMax
  })
}

function setWin(type){
  if(utils.isEqual(type, 'maximize')){
    state.isMax = true;
  }
  if(utils.isEqual(type, 'unmaximize')){
    state.isMax = false;
  }
  JuggleIMDesktop.setWindow({ type });
}


</script>

<template>
   <div class="tyn-desktop-header" v-if="juggle.isDesktop()">
    <ul class="tyn-desktop-navs" v-if="!utils.isMacBrowser()">
      <li class="tyn-desktop-nav">
        <a class="wr wr-win-hide" @click="setWin('minimize')"></a>
      </li>
      <li class="tyn-desktop-nav" v-if="state.isMax">
        <a class="wr wr-win-max" @click="setWin('unmaximize')"></a>
      </li>
      <li class="tyn-desktop-nav" v-else>
        <a class="wr wr-win-min" @click="setWin('maximize')"></a>
      </li>
      <li class="tyn-desktop-nav">
        <a class="wr wr-win-close" @click="setWin('close')"></a>
      </li>
    </ul>
  </div>
</template>
