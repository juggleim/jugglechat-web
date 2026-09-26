<script setup>
import { reactive, watch } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import { emojis } from "../common/emoji";
const props = defineProps(['isShow', 'message']);
const emit = defineEmits(["onhide", "onemit"]);

let state = reactive({
  isTop: true,
  list: emojis
});

watch(() => props.isShow, (value) => {
  let isTop = true;
  if(value){
    isTop = common.isElementTop(props.message);
    console.log('isTop', isTop)
  }
  utils.extend(state, { isTop });
})
</script>
<template>
  <div class="jg-reaction-emoji-pn" :class="[props.isShow ? 'tyn-emoji-pn show-aside fadein-o4' : 'tyn-emoji-pn', !state.isTop ? 'jg-reaction-top' :'jg-reaction-bottom']" @mouseleave="emit('onhide')">
    <div class="tyn-emoni-box">
      <div class="emojis__grid">
        <div @click="emit('onemit', item)" class="emoji-item" v-for="item in state.list">{{ item.emoji }}</div>
      </div>
    </div>
  </div>
  <div class="dropmenu-backdrop" :class="{'show-menu-back': props.isShow}" @click="emit('onhide')" @click.right.prevent="emit('onhide')"></div>  
</template>