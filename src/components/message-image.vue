<script setup>
import { reactive, nextTick } from "vue";
import GroupReads from "./group-reads.vue";
import utils from "../common/utils";
import messageUtils from "./message-utils";
import Dropdownmenu from "./message-menu.vue";

const props = defineProps(["message"]);
const emit = defineEmits(["onpreview", "onrecall", "ontransfer", "onreply"]);

function onPreview() {
  let { content: { url } } = props.message;
  emit('onpreview', { url });
}

let state = reactive({
  isShowDrop: false,
  isShowGroupDetail: false,
});
function onTransfer(){
  emit('ontransfer', {})
}
function onShowDrop(isShow) {
  state.isShowDrop = isShow;
}
function onReply(){
  emit('onreply', props.message);
}
function onRecall() {
  let message = props.message;
  emit('onrecall', message);
  onShowDrop(false);
}
function onShowReadDetail(isShow) {
  let message = props.message;
  if (!messageUtils.isGroup(message)) {
    return;
  }
  utils.extend(state, { isShowGroupDetail: isShow });
}

nextTick(() => {
  let node = document.querySelector(`#img_msg_${props.message.messageId}`);
  node.onload = function(){
    document.querySelector(`div[mid=${node.id}]`).style.display = 'none';
  }
})

function calc(){
  let maxWidth = 280;
  let width = props.message.content.width || maxWidth;
  let ratio = 1;
  if(width > maxWidth){
    ratio = maxWidth / width;
    width = width * ratio;
  }
  let height = props.message.content.height || 200;
  height = height * ratio + 20;
  return { width, height }
}
</script>

<template>
  <div class="tyn-reply-avatar">
    <div class="tyn-media tyn-size-md">
      <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.sender.portrait + ')' }"></div>
    </div>
  </div>
  <div class="tyn-reply-group" @mouseleave="onShowDrop(false)">
    <span class="jg-sender-name" v-if="messageUtils.isGroup(props.message)">{{ props.message.sender.name }}</span>
    <div class="tyn-reply-bubble">
      <div class="tyn-reply-media tyn-reply-meida-img" :messageid="props.message.messageId" :style="{'height': (calc().height) + 'px', 'width': (calc().width) + 'px'}">
        <div class="tyn-img-loading" :mid="'img_msg_' +props.message.messageId">
          <div class="jg-img-loader"></div>
        </div>
        <a class="glightbox" data-gallery="media-photo" @click="onPreview">
          <img v-if="props.message.localUrl" :src="props.message.localUrl" class="tyn-image" >
          <img v-else :src="props.message.content.thumbnail" class="tyn-image fadein-o" :id="'img_msg_' +props.message.messageId" alt/>
          <div class="jg-progress" v-if="props.message.percent < 99.9">
            <div class="jg-progress-stacked" :style="{ 'width': props.message.percent + '%' }"></div>
          </div>
        </a>
        <div class="wr message-state wr-circle" @click.stop="onShowReadDetail(true)"
        :class="{ 'wr-dui': props.message.isRead && !messageUtils.isGroup(props.message) || props.message.unreadCount == 0, 'message-read': props.message.isRead && !messageUtils.isGroup(props.message) || props.message.readCount > 0 }"
          v-if="props.message.isSender">
          <div v-if="messageUtils.isGroup(props.message) && props.message.readCount > 0 && props.message.unreadCount > 0"
            class="message-group-state"
            :style="{ 'background-image': 'conic-gradient( #008000 ' + props.message.readPercent + 'deg, transparent ' + props.message.readPercent + '.2deg)' }">
          </div>
          <GroupReads v-if="state.isShowGroupDetail" :message="props.message"></GroupReads>
          <div class="modal-backdrop fade show modal-tp-backdrop" @click.stop="onShowReadDetail(false)"
            v-if="state.isShowGroupDetail" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false"></div>
        </div>
        <div class="jg-message-senttime" v-if="props.message.sentTime">{{ utils.formatTimetoHM(props.message.sentTime) }}</div>
      </div>

      <ul class="tyn-reply-tools">
        <li class="dropup-center">
          <button class="btn btn-icon btn-sm btn-transparent btn-pill wr wr-more" data-bs-toggle="dropdown"
            @click="onShowDrop(true)"></button>
            <Dropdownmenu :is-show="state.isShowDrop" :message="props.message" @onrecall="onRecall()" @ontransfer="onTransfer()" @onreply="onReply()"  @onhide="onShowDrop(false)"></Dropdownmenu>
        </li>
      </ul>
      <!-- .tyn-reply-tools -->
    </div>
  </div></template>
