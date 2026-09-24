<script setup>
import { reactive, watch } from "vue";
import im from "../common/im";
import utils from "../common/utils";
import common from "../common/common";
import { emojis } from '../common/emoji';
const props = defineProps(['isShow', 'reactions']);
const emit = defineEmits(["onhide", "oncancel"]);


let juggle = im.getCurrent();
let { MessageType } = juggle;

let state = reactive({
});
watch(() => props.message, (value) => {
  console.log(value);
})
function getStaker(str){
  let index = utils.find(emojis, (emoji) => {
    return utils.isEqual(emoji.emoji, str);
  });
  let staker = emojis[index];
  return staker;
}
</script>
<template>
  <div class="fadein-o4" :class="{ 'show': props.isShow}">
    <ul class="jg-reactions">
      <li class="jg-reaction" v-for="(list, key) in props.reactions" @click.stop="emit('oncancel', { emoji: key })">
        <div class="jg-reaction-emoji">
          <div v-if="getStaker(key)" class="jg-reaction-emoji-img" :style="{'background-image': 'url('+getStaker(key).img+')'}"></div>
          <div v-else class="jg-reaction-emoji-content">{{ key }}</div>
        </div>
        <ul class="jg-reaction-names">
          <li class="jg-reaction-name">{{ list.length }}</li>
        </ul>
      </li>
    </ul>
  </div>
  <!-- <div class="dropmenu-backdrop" :class="{'show-menu-back': props.isShow}" @click="emit('onhide')"></div>   -->
</template>
