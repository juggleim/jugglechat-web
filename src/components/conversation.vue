<script setup>
import im from "../common/im";
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import utils from "../common/utils";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
const props = defineProps(["conversation", "cls", "isRemove", "index"]);
const emit = defineEmits(["onemit"]);
let context = getCurrentInstance();

let juggle = im.getCurrent();
let { ConversationType } = juggle;
let state = reactive({});
let user = Storage.get(STORAGE.USER_TOKEN);

function onSelected(item){
  utils.map(state.list, (_item) => {
    _item.checked = false;
    if(utils.isEqual(item.time, _item.time)){
      _item.checked = !item.checked;
    }
  })
}

</script>
<template>
  <div class="jg-group-conver fadein-o4">
    <span class="wr jg-group-conver-btn" :class="[props.cls]" @click="emit('onemit', { conversation: props.conversation, isRemove: props.isRemove, index: props.index })"></span>
    <div class="tyn-avatar jg-group-conver-avatar" :style="{'background-image': 'url(' + props.conversation.conversationPortrait + ')'}"></div>
    <div class="jg-group-conver-name">{{ props.conversation.conversationTitle || 'JG' }}</div>
  </div>
</template>
