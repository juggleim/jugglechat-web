<script setup>
import { reactive, watch } from "vue";
import im from "../common/im";
import utils from "../common/utils";
import common from "../common/common";
const props = defineProps(['isShow', 'reactions']);
const emit = defineEmits(["onhide", "oncancel"]);

let juggle = im.getCurrent();
let { MessageType } = juggle;

let state = reactive({
});
watch(() => props.isShow, (value) => {})
</script>
<template>
  <div class="fadein-o4" :class="{ 'show': props.isShow}">
    <ul class="jg-reactions">
      <li class="jg-reaction" v-for="(list, key) in props.reactions" @click.stop="emit('oncancel', { text: key })">
        <div class="jg-reaction-emoji">{{ key }}</div>
        <ul class="jg-reaction-names">
          <li class="jg-reaction-name">{{ list.length }}</li>
        </ul>
      </li>
    </ul>
  </div>
  <!-- <div class="dropmenu-backdrop" :class="{'show-menu-back': props.isShow}" @click="emit('onhide')"></div>   -->
</template>
