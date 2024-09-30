<script setup>
import im from "../../common/im";
import common from "../../common/common";
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import utils from "../../common/utils";
import emitter from "../../common/emmit";
import { EVENT_NAME } from "../../common/enum";
import ConversationRightMenu from "../../components/conversation-menu.vue";

let context = getCurrentInstance();
const props = defineProps(["conversations", "tag"]);
const emit = defineEmits(["onhide", "onmark", "ontop", "ondisturb", "onremove", "onclearmsg", "onconversation", "onloadmore"]);
let juggle = im.getCurrent();
let { MessageType, UndisturbType } = juggle;

let state = reactive({
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

function onShowDropmenu(e) {
  let current = e.currentTarget;
  let index = current.getAttribute("index");

  let rect = e.target.getBoundingClientRect();
  let x = e.x - rect.x;
  if(x > 150){
    x = 150;
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
      emit('onloadmore', { tag: props.tag, callback: () => {
        canscroll = true;
      }});
    }
  });
});

function onConversation(item, index) {
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
function clearUnreadCount(item, index) {
  let conversation = props.conversations[index];
  conversation.unreadCount = 0;
  let { conversationId, conversationType, latestUnreadIndex } = item;
  juggle.clearUnreadcount({
    conversationId,
    conversationType,
    unreadIndex: latestUnreadIndex
  });
}
</script>

<template>
 <div class="tyn-aside-body" ref="conversations" :tag="props.tag">
    <ul class="tyn-aside-list">
      <li
        class="tyn-aside-item js-toggle-main"
        v-for="(item, index) in props.conversations"
        :class="{ 'active': item.isActive }"
        @click="onConversation(item, index)"
        :index="index"
        :uid="item.conversationType + '_' + item.conversationId"
        @click.right.prevent="onShowDropmenu"
      >
        <div class="tyn-media-group">
          <div class="tyn-media tyn-size-lg">
            <div
              class="tyn-avatar tyn-s-avatar position-relative tyn-circle"
              :style="{ 'background-image': 'url(' + item.conversationPortrait + ')' }"
            >
              <div
                class="badge bg-danger position-absolute rounded-pill top-0 end-0 mt-n2 me-n2"
                v-if="item.unreadCount > 0 && utils.isEqual(item.undisturbType, UndisturbType.UNDISTURB)"
              >{{ item.unreadCount }}</div>
              <div
                class="badge bg-danger position-absolute rounded-pill top-0 end-0 mt-n2 me-n2"
                v-if="item.unreadCount == 0 && item.unreadTag && utils.isEqual(item.undisturbType, UndisturbType.UNDISTURB)"
              >1</div>
              <div class="position-absolute rounded-pill top-1 end-0 mt-n2 me-n1 wr wr-dot text-danger conver-dot" v-if="((item.unreadCount == 0 && item.unreadTag) || item.unreadCount > 0) && utils.isEqual(item.undisturbType, UndisturbType.DISTURB)"></div>
            </div>
          </div>
          <div class="tyn-media-col">
            <div class="tyn-media-row jg-conversation-title">
              <h6 class="name">{{ item.conversationTitle }}</h6>
              <span class="wr wr-soundoff jg-conver-mute" v-if="utils.isEqual(item.undisturbType, UndisturbType.DISTURB)"></span>
              <span class="typing" v-if="item.isTyping">typing ...</span>
            </div>
            <div class="tyn-media-row has-dot-sap between">
              <p
                class="content wr"
                v-if="item.draft"
                :class="{ 'wr-modify-pen content-draft': item.draft }"
              >
                {{
                item.draft }}
              </p>
              <p class="content" v-else>
                <span
                  class="text-danger lastmsg-mention"
                  v-if="item.f_mentionContent != ''"
                >{{ item.f_mentionContent }}</span>
                {{ item.shortName }}
              </p>
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
      <h6>没有记录</h6>
    </div>
  </div>
</template>
