<script setup>
import { reactive, watch } from "vue";
import im from "../common/im";
import utils from "../common/utils";
import common from "../common/common";

const props = defineProps(['isShow', 'message']);
const emit = defineEmits(["onrecall", "onmodify", "ontransfer", "onreply", "onhide", "onremove", "oncopy", "onpinned"]);

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
  <div class="dropdown-menu dropdown-menu-xxs fadein-o4" :class="{ 'show': props.isShow, 'dropdown-menu-xxs-bottom': !state.isTop }">
    <ul class="tyn-list-links">
      <li class="tyn-list-link">
        <a href="#" class="wr wr-recall" @click.stop="emit('onrecall')" v-if="props.message.isSender">
          <span>消息撤回</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-top" @click.stop="emit('onpinned')">
          <span>消息置顶</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-share" @click.stop="emit('ontransfer')">
          <span>消息转发</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-message-square" @click.stop="emit('onreply')">
          <span>消息回复</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <div class="jg-bottom-line"></div>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-copy" @click.stop="emit('oncopy')" v-if="utils.isEqual(props.message.name, MessageType.TEXT)">
          <span>复制消息</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-modify" @click.stop="emit('onmodify')" v-if="props.message.isSender && utils.isEqual(props.message.name, MessageType.TEXT)">
          <span>消息修改</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-delete" @click.stop="emit('onremove')">
          <span>消息删除</span>
        </a>
      </li>
    </ul>
    <div class="fade-bg" v-if="!state.isShow" @click.stop="emit('onhide')"></div>
  </div>
</template>
