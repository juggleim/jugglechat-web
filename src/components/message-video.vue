<script setup>
import { reactive, getCurrentInstance } from "vue";
import utils from "../common/utils";
import GroupReads from "./group-reads.vue";
import messageUtils from "./message-utils";
import Dropdownmenu from "./message-menu.vue";

const props = defineProps(["message"]);
const emit = defineEmits(["onrecall", "ontransfer", "onreply"]);

let state = reactive({
  isShowDrop: false,
  isPlaying: false,
  isShowGroupDetail: false,
});

let context = getCurrentInstance();

function onReply(){
  emit('onreply', props.message);
}
function onTransfer(){
  emit('ontransfer', {})
}
function onShowDrop(isShow) {
  state.isShowDrop = isShow;
}
function onRecall() {
  let message = props.message;
  emit('onrecall', message);
  onShowDrop(false);
}
function onPlay() {
  let { video } = context.refs;
  let { isPlaying } = state;
  if (isPlaying) {
    video.pause();
  } else {
    video.play();
  }
  utils.extend(state, { isPlaying: !isPlaying });
}
function onShowReadDetail(isShow) {
  let message = props.message;
  if (!messageUtils.isGroup(message)) {
    return;
  }
  utils.extend(state, { isShowGroupDetail: isShow });
}
</script>

<template>
  <div class="tyn-reply-avatar">
    <div class="tyn-media tyn-size-md tyn-circle">
      <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.sender.portrait + ')' }"></div>
    </div>
  </div>
  <div class="tyn-reply-group" @mouseleave="onShowDrop(false)">
    <div class="tyn-reply-bubble">
      <div class="tyn-reply-media wr" :messageid="props.message.messageId">
        <a class="glightbox" data-gallery="media-video" @click="onPlay">
          <video :src="props.message.localUrl || props.message.content.url" ref="video" class="tyn-image"></video>
          <div class="tyn-video-icon wr wr-video" v-if="!state.isPlaying"></div>
        </a>
        <div class="wr message-state" @click.stop="onShowReadDetail(true)"
        :class="{ 'wr-dui': props.message.isRead, 'wr-circle': !props.message.isRead, 'message-read': props.message.isRead || props.message.readCount > 0 }"
          v-if="props.message.isSender">
          <div v-if="messageUtils.isGroup(props.message) && props.message.readCount > 0 && props.message.unreadCount > 0"
            class="message-group-state"
            :style="{ 'background-image': 'conic-gradient( #008000 ' + props.message.readPercent + 'deg, transparent ' + props.message.readPercent + '.2deg)' }">
          </div>
          <GroupReads v-if="state.isShowGroupDetail" :message="props.message"></GroupReads>
          <div class="modal-backdrop fade show modal-tp-backdrop" @click.stop="onShowReadDetail(false)"
            v-if="state.isShowGroupDetail" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false"></div>
        </div>
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
    <!-- .tyn-reply-bubble -->
  </div>
  <!-- .tyn-reply-group --></template>
