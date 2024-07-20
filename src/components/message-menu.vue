<script setup>
import { reactive, watch } from "vue";
import im from "../common/im";
import utils from "../common/utils";
import common from "../common/common";
const props = defineProps(['isShow', 'message']);
const emit = defineEmits(["onrecall", "onmodify", "ontransfer", "onreply", "onhide"]);

let juggle = im.getCurrent();
let { MessageType } = juggle;

let state = reactive({
  isTop: true,
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
  <div class="dropdown-menu dropdown-menu-xxs" :class="{ 'show': props.isShow, 'dropdown-menu-xxs-bottom': !state.isTop }">
    <ul class="tyn-list-links">
      <li>
        <a href="#" class="wr wr-modify" @click="emit('onmodify')" v-if="props.message.isSender && utils.isEqual(props.message.name, MessageType.TEXT)">
          <span>消息修改</span>
        </a>
      </li>
      <li>
        <a href="#" class="wr wr-recall" @click="emit('onrecall')" v-if="props.message.isSender">
          <span>消息撤回</span>
        </a>
      </li>
      <li>
        <a href="#" class="wr wr-share" @click="emit('ontransfer')">
          <span>消息转发</span>
        </a>
      </li>
      <li>
        <a href="#" class="wr wr-message-square" @click="emit('onreply')">
          <span>消息回复</span>
        </a>
      </li>
    </ul>
    <div class="fade-bg" v-if="!state.isShow" @click="emit('onhide')"></div>
  </div>
</template>
