<script setup>
import im from "../../common/im";
import common from "../../common/common";
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import utils from "../../common/utils";
import emitter from "../../common/emmit";
import { EVENT_NAME } from "../../common/enum";
import ConversationRightMenu from "../../components/conversation-menu.vue";
import Avatar from "../../components/avatar.vue";
import messageUtils from "../../components/message-utils";

let context = getCurrentInstance();
const props = defineProps(["conversations", "tag"]);
const emit = defineEmits(["onhide", "onmark", "ontop", "ondisturb", "onremove", "onclearmsg", "onconversation", "onloadmore"]);
let juggle = im.getCurrent();
let { MessageType, UndisturbType, UserType } = juggle;

let state = reactive({
  i18n: common.i18n(),
  dropmenuX: 0,
  currentConversation: {}
});

function onHideDrop(conversation) {
  emit('onhide', conversation)
}
function onMarkUnread(index) {
  emit('onmark', index);
}
function onRemoveConversation(index) {
  emit('onremove', index);
}
function onClearMessages(index) {
  emit('onclearmsg', index);
}
function onConversationDisturb(item){
  emit('ondisturb', item);
}
function onSetConversationTop(item, isTop) {
  emit('ontop', item, isTop);
}

function isGroup(item){
  return messageUtils.isGroup(item);
}
function onShowDropmenu(e) {
  e.stopPropagation();
  let current = e.currentTarget;
  let index = current.getAttribute("index");

  let rect = e.target.getBoundingClientRect();
  let x = e.x - rect.x;
  if(x > 150){
    x = 150;
  }
  if(isNaN(x)){
    x = 80;
  }
  state.dropmenuX = x;

  let conversation = props.conversations[index];
  conversation.isShowDrop = true;
}
let canscroll = true;
nextTick(() => {
  let { conversations } = context.refs;
  conversations.addEventListener("scroll", () => {
    let scrollTop = conversations.scrollTop;
    let scrollHeight = conversations.scrollHeight;
    let rectHeight = conversations.getBoundingClientRect().height;
    let isNeedLoad = scrollHeight - scrollTop - rectHeight < 100;
    if (isNeedLoad && canscroll) {
      let isFirst = false;
      canscroll = false;
      emit('onloadmore', { tag: props.tag, callback: () => {
        canscroll = true;
      }});
    }
  });
});

// function onConversation(item, index) {
function onConversation(e) {
  e.preventDefault();
  let index = e.currentTarget.getAttribute('index');
  let item = props.conversations[index];
  
  props.conversations.map((conversation, i) => {
    let isActive = utils.isEqual(
      item.conversationId,
      conversation.conversationId
    );
    if (isActive) {
      conversation.f_mentionContent = "";
      index = i;
    }
    conversation.isActive = isActive;
    return conversation;
  });
  item.isActive = true;
  emit("onconversation", item);
  clearUnreadCount(item, index);
}
async function clearUnreadCount(item, index) {
  let conversation = props.conversations[index];
  conversation.unreadCount = 0;
  let { conversationId, conversationType, latestUnreadIndex } = item;
  let params = {
    conversationId,
    conversationType,
    unreadIndex: latestUnreadIndex
  };
  let result = await juggle.clearUnreadcount(params);
  console.log('clearunreadcount', params);
}
</script>

<template>
 <div class="tyn-aside-body" ref="conversations" :tag="props.tag" :class="{'tyn-h5-aside-body': !utils.isUniapp()}">
    <ul class="tyn-aside-list">
      <li
        class="tyn-aside-item js-toggle-main"
        v-for="(item, index) in props.conversations"
        :class="{ 'active': item.isActive }"
        @click="onConversation"
        :index="index"
        :uid="item.conversationType + '_' + item.conversationId"
        @click.right.prevent="onShowDropmenu"
        v-longpress="onShowDropmenu"
      >
        <div class="tyn-media-group">
          <div class="tyn-media tyn-size-lg">
            <Avatar 
              :cls="'tyn-s-avatar'"
              :avatar="isGroup(item) ? '' :item.conversationPortrait"
              :name="item.conversationTitle">

              <div
                class="badge bg-danger position-absolute rounded-pill top-0 end-0 mt-n2 me-n2"
                v-if="item.unreadCount > 0 && utils.isEqual(item.undisturbType, UndisturbType.UNDISTURB)"
              >{{ item.unreadCount }}</div>
              <div
                class="badge bg-danger position-absolute rounded-pill top-0 end-0 mt-n2 me-n2"
                v-if="item.unreadCount == 0 && item.unreadTag && utils.isEqual(item.undisturbType, UndisturbType.UNDISTURB)"
              >1</div>
              <div class="position-absolute rounded-pill top-1 end-0 mt-n2 me-n1 wr wr-dot text-danger conver-dot" v-if="((item.unreadCount == 0 && item.unreadTag) || item.unreadCount > 0) && utils.isEqual(item.undisturbType, UndisturbType.DISTURB)"></div>

            </Avatar>
           
          </div>
          <div class="tyn-media-col">
            <div class="tyn-media-row jg-conversation-title">
              <h6 class="name">
                {{ item.conversationTitle }}
                <span class="jg-tag jg-tag-agent" v-if="item.conversationUserType == UserType.BOT">{{ state.i18n.MAIN.AGENT }}</span>
              </h6>
              <span class="wr wr-soundoff jg-conver-mute" v-if="utils.isEqual(item.undisturbType, UndisturbType.DISTURB)"></span>
              <span class="typing" v-if="item.isTyping">typing ...</span>
            </div>
            <div class="tyn-media-row has-dot-sap between">
              <span
                class="content wr"
                v-if="item.draft"
                :class="{ 'wr-modify-pen content-draft': item.draft }"
              >
                {{
                item.draft }}
              </span>
              <span class="content" v-else v-html="item.shortName">
              
              </span>
              <span class="meta">{{ item.f_time }}</span>
            </div>
          </div>
        </div>
        <ConversationRightMenu :is-show="item.isShowDrop" :conversation="item" :index="index" 
          @onhide="onHideDrop" :x="state.dropmenuX"
          @onmark="onMarkUnread"
          @ontop="onSetConversationTop"
          @ondisturb="onConversationDisturb"
          @onremove="onRemoveConversation"
          @onclearmsg="onClearMessages"
          >
        </ConversationRightMenu>
      </li>
    </ul>
    <div class="tyn-aside-row text-center" v-if="props.conversations.length == 0">
      <h6>{{ state.i18n.COMMON.LIST_NONE }}</h6>
    </div>
  </div>
</template>
