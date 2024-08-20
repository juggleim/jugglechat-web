<script setup>
import im from "../common/im";
import { reactive, watch } from "vue";
import utils from "../common/utils";
import common from "../common/common";

let juggle = im.getCurrent();
const emit = defineEmits(["onnav"]);

let state = reactive({
  content: '',
  conversations: [
  ],
  currentConversation: {},
  isShowResult: false,
});

let timer = 0;
function onSearch(){
  let { content } = state;
  if(utils.isEqual(content.length, 0)){
    return;
  }
  onShowResult(true);
  timer = setTimeout(() => {
    search({ content });
  }, 100)
}
function search({ content }){
  let params = {
    keywords: [content],
    offset: 1,
    limit: 200,
  };
  juggle.searchMessages(params).then(({ isFinished, total, list }) => {
    console.log(isFinished, total, list)
    utils.extend(state, { conversations: list });
  });
}
function onShowResult(isShow){
  utils.extend(state, { isShowResult: isShow, currentConversation: {} })
}

function onConversation(item, index){
  state.currentConversation = item;
  state.conversations.map((conversation) => {
    let isActive = utils.isEqual(item.conversationId, conversation.conversationId);
    conversation.isActive = isActive;
    return conversation;
  });
}
function getConversationTime(sentTime) {
  let str = utils.getCurrentTime();
  let current = new Date(str);
  let time = utils.formatTime(sentTime, 'MM-dd hh:mm');
  if (sentTime > current) {
    time = utils.formatTime(sentTime, 'hh:mm');
  }
  return time;
}

function onNavChat(){
  let { conversationType, conversationId } = state.currentConversation;
  emit('onnav', { conversationType, conversationId  });
  state.content = '';
}

function getContent(item){
  let content = im.msgShortFormat(item);
  content = common.htmlToContent(content);
  content = content.replaceAll(state.content, `<span class="jg-keyword">${state.content}<span>`);
  return content;
}
watch(() => state.content, (val) => {
  if(utils.isEqual(val.length, 0)){
    onShowResult(false);
  }
})
</script>

<template>
  <div class="jg-asider-seach-box">
    <div class="form-group">
      <div class="form-control-wrap form-control-solid">
        <div class="jg-search-icon wr wr-search"></div>
        <input type="text" class="form-control" v-model="state.content" placeholder="Search Chat" autocomplete="off"  @keydown.enter="onSearch" @input="onSearch"/>
      </div>
    </div>

    <div class="jg-search-rs-box" v-if="state.isShowResult">
      <ul class="jg-search-list">
        <li class="jg-search-item">
          <div class="jg-search-item-title">
            聊天记录
            <span class="fz-9" v-if="state.conversations.length > 0">( {{ state.conversations.length }} ) 个记录</span>
          </div>
          <ul class="jg-search-children">
            <li class="jg-search-child jg-not-matched" v-if="state.conversations.length == 0">
              <span>本地没有匹配记录</span>
            </li>
            <li class="jg-search-child">
              <li class="tyn-aside-item js-toggle-main" v-for="(item, index) in state.conversations"
                :class="{ 'active': item.isActive }" @click="onConversation(item, index)">
                <div class="tyn-media-group">
                  <div class="tyn-media tyn-size-rg">
                    <div class="tyn-avatar tyn-s-avatar position-relative tyn-circle"
                      :style="{ 'background-image': 'url(' + item.conversationPortrait + ')' }">
                    </div>
                  </div>
                  <div class="tyn-media-col">
                    <div class="tyn-media-row">
                      <h6 class="name">{{ item.conversationTitle }}</h6>
                    </div>
                    <div class="tyn-media-row has-dot-sap between">
                      <p class="content">
                       {{ item.matchedCount }} 相关记录
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </li>
          </ul>
        </li>
      </ul>
      <div class="jg-search-preview-box" v-if="!utils.isEmpty(state.currentConversation)">
        <div class="jg-search-pv-header">
          <div class="total">{{ state.currentConversation.matchedList.length }} 条与 {{ state.content }} 相关的搜索结果</div>
          <div class="nav wr wr-right-af" @click="onNavChat">进入聊天</div>
        </div>
        <div class="jg-search-pv-body">
          <ul class="jg-search-pv-msgs">
            <li class="tyn-aside-item js-toggle-main" v-for="(item, index) in state.currentConversation.matchedList" @click="onNavChat">
                <div class="tyn-media-group">
                  <div class="tyn-media tyn-size-lg">
                    <div class="tyn-avatar tyn-s-avatar position-relative tyn-circle"
                      :style="{ 'background-image': 'url(' + item.sender.portrait + ')' }">
                    </div>
                  </div>
                  <div class="tyn-media-col">
                    <div class="tyn-media-row">
                      <h6 class="name">{{  item.sender.name }}</h6>
                    </div>
                    <div class="tyn-media-row has-dot-sap between">
                      <p class="content" v-html="getContent(item)"></p>
                      <span class="meta">{{ getConversationTime(item.sentTime) }}</span>
                    </div>
                  </div>
                </div>
              </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
