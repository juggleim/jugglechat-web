<script setup>
import Avatar from "./avatar.vue";
import im from "../common/im";
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import utils from "../common/utils";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
import common from "../common/common";
const props = defineProps(["conversation", "cls", "isRemove", "index"]);
const emit = defineEmits(["onemit"]);
let context = getCurrentInstance();

let juggle = im.getCurrent();
let { ConversationType } = juggle;
let state = reactive({});
let user = Storage.get(STORAGE.USER_TOKEN);

function getAvatar(){
  let { conversation } = props;
  let { conversationType, conversationPortrait } = conversation;
  let avatar = '';
  if(!common.isGroup(conversation)){
    avatar = conversationPortrait;
  }
  return avatar;
}

</script>
<template>
  <div class="jg-group-conver fadein-o4">
    <span class="wr jg-group-conver-btn" :class="[props.cls]" @click="emit('onemit', { conversation: props.conversation, isRemove: props.isRemove, index: props.index })"></span>
    <Avatar :cls="'tyn-size-md jg-size-md jg-group-conver-avatar'" :avatar="getAvatar()" :name="props.conversation.conversationTitle"></Avatar>
    <div class="jg-group-conver-name">{{ props.conversation.conversationTitle || 'JG' }}</div>
  </div>
</template>
