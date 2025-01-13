<script setup>
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";
import Asider from "./aside.vue";
import im from "../common/im";
import { User } from "../services/index";
import { RESPONSE, STORAGE, EVENT_NAME } from "../common/enum";
import Storage from "../common/storage";

import Text from './message-text.vue';
import File from './message-file.vue';
import ImageMessage from './message-image.vue';
import Video from './message-video.vue';
import Merge from './message-merge.vue';

const props = defineProps(["isShow", "right"]);
const emit = defineEmits(["oncancel"]);
const context = getCurrentInstance();
let juggle = im.getCurrent();
let { MessageType } = juggle;

let state = reactive({
  list: [],
  page: 1,
  count: 20,
  hasMore: true,
  isPlaying: false
});

function onCancel(){
  emit('oncancel', {});
}

let isFetching = false;
function getMessages(params){
  if(isFetching){
    return;
  }
  isFetching = true;
  let { count, page } = params;
  let { list } = state;
  juggle.getFavoriteMessages(params).then((result) => {
    let _list = result.list;
    let hasMore = count > _list.length;
    state.list = list.concat(_list);
    utils.extend(state, { page: page + 1, hasMore });
    isFetching = false;
  }, () => {
    isFetching = false;
  })
}

function onRemove(message, index){
  let { sender, conversationType, conversationId, messageId } = message;
  juggle.removeFavoriteMessages({
    messages: [{ 
      conversationType: conversationType,
      conversationId: conversationId,
      messageId: messageId,
      senderId: sender.id,
    }]
  }).then((result) => {
    state.list.splice(index, 1);
  }, (error) => {
    context.proxy.$toast({ text: `取消收藏失败: ${error.code}`, icon: 'error' });
  });
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
let canscroll = true;
nextTick(() => {
  let { favmsgs } = context.refs;
  favmsgs.addEventListener("scroll", () => {
    let scrollTop = favmsgs.scrollTop;
    let scrollHeight = favmsgs.scrollHeight;
    let rectHeight = favmsgs.getBoundingClientRect().height;
    let isNeedLoad = scrollHeight - scrollTop - rectHeight < 100;
    if (isNeedLoad && canscroll) {
      let isFirst = false;
      let { page, count } = state;
      getMessages({ page, count });
    }
  });
});

watch(() => props.isShow, () => {
  if(props.isShow){
    let { page, count } = state;
    getMessages({ page, count });
  }else{
    utils.extend(state, { list: [], page: 1 });
  }
})

</script>

<template>
  <Asider :is-show="props.isShow" :title="'消息收藏'" :right="props.right" @oncancel="onCancel">
    <div class="jg-aside-favorite-body">
      <ul class="jg-fav-list" ref="favmsgs">
        <li class="jg-fav-item" v-for="(item, index) in state.list">
          <div class="jg-fav-msg" v-if="utils.isEqual(item.message.name, MessageType.TEXT)">
            <div class="jg-fav-msg-text">{{ item.message.content.content }}</div>
            <ul class="jg-fav-tools">
              <li class="jg-fav-tool wr wr-delete warn" @click.stop="onRemove(item.message, index)"></li>
            </ul>
          </div>
          <div class="jg-fav-msg" v-if="utils.isEqual(item.message.name, MessageType.IMAGE)">
            <img :src="item.message.content.thumbnail" class="tyn-image fadein-o" alt/>
            <ul class="jg-fav-tools">
              <li class="jg-fav-tool wr wr-delete warn" @click.stop="onRemove(item.message, index)"></li>
            </ul>
          </div>
          <div class="jg-fav-msg" v-if="utils.isEqual(item.message.name, MessageType.FILE)">
            <a :href="item.message.content.url" class="tyn-file" :download="item.message.content.name">
              <div class="tyn-media-group">
                <div class="tyn-media tyn-size-lg text-bg-light wr wr-file tyb-msg-fileicon">
                </div>
                <div class="tyn-media-col">
                  <h6 class="name">{{ item.message.content.name }}</h6>
                  <div class="meta">{{ (Number(item.message.content.size) || 0).toFixed(2) }} KB</div>
                </div>
              </div>
            </a>
            <ul class="jg-fav-tools">
              <li class="jg-fav-tool wr wr-delete warn" @click.stop="onRemove(item.message, index)"></li>
            </ul>
          </div>
          <div class="jg-fav-msg" v-if="utils.isEqual(item.message.name, MessageType.VIDEO)">
            <a class="glightbox" data-gallery="media-video">
              <video :src="item.message.content.url" class="tyn-image" controls></video>
            </a>
            <ul class="jg-fav-tools">
              <li class="jg-fav-tool wr wr-delete warn" @click.stop="onRemove(item.message, index)"></li>
            </ul>
          </div>
          <div class="jg-fav-msg" v-if="utils.isEqual(item.message.name, MessageType.MERGE)">
            <div class="tyn-reply-merge">
              <div class="tyn-media-row">
                <span class="tyn-msg-mergetitle">{{ item.message.content.title }}</span>
              </div>
              <div class="tyn-media-row tyn-msg-merge-list" v-for="preview in item.message.content.previewList">
                <span class="sender">{{ preview.senderName }}:</span>
                <span class="message">{{ preview.content }}</span>
              </div>
            </div>
            <ul class="jg-fav-tools">
              <li class="jg-fav-tool wr wr-delete warn" @click.stop="onRemove(item.message, index)"></li>
            </ul>
          </div>
          <div class="jg-fav-info">
            <div class="jg-fav-title">
              <div class="tyn-avatar tyn-s-avatar jg-fav-avatar" :style="{ 'background-image': 'url(' + item.message.sender.portrait + ')' }"></div>
              <div class="jg-fav-label jg-ellipsis">{{ item.message.sender.name }} 来自 {{ item.message.conversationTitle }}</div>
            </div>
            <div class="jg-fav-time">{{ utils.formatTime(item.message.sentTime, 'MM-dd hh:mm') }}</div>
          </div>
        </li>
      </ul>
    </div>
  </Asider>
</template>
