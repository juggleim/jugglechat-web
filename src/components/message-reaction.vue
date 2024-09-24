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
      <li class="jg-reaction" v-for="reaction in props.reactions" @click.stop="emit('oncancel', reaction)">
        <div class="jg-reaction-emoji">{{ reaction.text }}</div>
        <ul class="jg-reaction-names">
          <li class="jg-reaction-name">{{ reaction.name }}</li>
        </ul>
      </li>
    </ul>
  </div>
  <!-- <div class="dropmenu-backdrop" :class="{'show-menu-back': props.isShow}" @click="emit('onhide')"></div>   -->
</template>
