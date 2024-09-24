<script setup>
import { reactive, watch } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import { EMOJI_POS_LIST } from "../common/enum";
const props = defineProps(['isShow', 'message']);
const emit = defineEmits(["onhide", "onemit"]);

let list = utils.clone(EMOJI_POS_LIST);

let state = reactive({
  isTop: true,
  list: list
});

watch(() => props.isShow, (value) => {
  let isTop = true;
  if(value){
    isTop = common.isElementTop(props.message);
  }
  utils.extend(state, { isTop });
})
</script>
<template>
  <div class="jg-reaction-emoji-pn" :class="[props.isShow ? 'tyn-emoji-pn show-aside fadein-o4' : 'tyn-emoji-pn', !state.isTop ? 'jg-reaction-top' :'jg-reaction-bottom']" @mouseleave="emit('onhide')">
    <div class="tyn-emoni-box">
      <div class="emojis__grid">
        <div @click="emit('onemit', item)" role="img" aria-label="emoji" class="emoji emojis__emoji" v-for="item in state.list" :data="item.text" :style="['background-position:' + item.pos + ';']"></div>
      </div>
    </div>
  </div>
  <div class="dropmenu-backdrop" :class="{'show-menu-back': props.isShow}" @click="emit('onhide')" @click.right.prevent="emit('onhide')"></div>  
</template>