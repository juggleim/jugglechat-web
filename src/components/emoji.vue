<script setup>
import { reactive, watch } from "vue";
import utils from "../common/utils";
import { emojis } from "../common/emoji";
const props = defineProps(['isShow']);
const emit = defineEmits(["onhide", "onemit"]);

let state = reactive({
  list: emojis
});
</script>
<template>
  <div :class="[props.isShow ? 'tyn-emoji-pn show-aside fadein-o4' : 'tyn-emoji-pn']" @mouseleave="emit('onhide')">
    <div class="tyn-emoni-box">
      <div class="emojis__grid">
        <!-- <div @click="emit('onemit', item)" role="img" aria-label="emoji" class="emoji emojis__emoji" v-for="item in state.list" :style="['background-position:' + item.pos + ';']"></div> -->
        <div @click="emit('onemit', item)" class="emoji-item" v-for="item in state.list">{{ item.emoji }}</div>
      </div>
    </div>
  </div>
  <div class="dropmenu-backdrop" :class="{'show-menu-back': props.isShow}" @click="emit('onhide')"></div>  
</template>