<script setup>
import utils from "../../common/utils";
import { reactive, getCurrentInstance, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import Conversation from "./conversation.vue";
import None from "./none.vue";
import AisdeHeader from "../../components/aside-header.vue";
import { STORAGE, EVENT_NAME } from "../../common/enum";
import Storage from "../../common/storage";
import im from "../../common/im";
import common from "../../common/common";
import emitter from "../../common/emmit";
import messageUtils from "../../components/message-utils";
import conversationTools from "./conversation";
import JHeader from '../header/header.vue';
import ConversationGroup from './conversation-group.vue';
import ModalGroupMember from '../../components/modal-groups-member.vue';
import ConversationRightMenu from "../../components/conversation-menu.vue";
import conversationHandler from "./conversation-handler";
import conversationTopHandler from "./conversation-top-handler";
import conversationRemoveHandler from "./conversation-remove-handler";

const router = useRouter();
let {
  currentRoute: {
    _rawValue: { query }
  }
} = router;

let juggle = im.getCurrent();
let { UnreadTag, UndisturbType } = juggle;
let { Event, ConnectionState, MentionType, MessageType } = juggle;

let state = reactive({
  conversations: [],
  tops: [],
  currentConversation: {},
  currentUser: {},
  dropmenuX: 0,
  isShowConversationGroup: false,
  isShowGroupMemberManager: false,
});
emitter.$on(EVENT_NAME.ON_ADDED_FRIEND, (friend) => {
  let { type, id, avatar, name} = friend;
  let conversation = {
    conversationType: type,
    conversationId: id,
    conversationTitle: name,
    conversationPortrait: avatar,
    latestMessage: { sentTime: 0 },
    f_mentionContent: '',
    shortName: '新朋友',
  }
  state.conversations.unshift(conversation);
  state.currentConversation = conversation;
});
function onShowDropmenu(e) {
  let current = e.currentTarget;
  let index = current.getAttribute("index");

  let rect = e.target.getBoundingClientRect();
  let x = e.x - rect.x;
  if(x > 150){
    x = 150;
  }
  state.dropmenuX = x;

  let conversation = state.conversations[index];
  conversation.isShowDrop = true;
}
function onHideDrop(conversation) {
  conversation.isShowDrop = false;
}
function onShowTopDropmenu(index) {
  let conversation = state.tops[index];
  conversation.isShowTopDrop = true;
}
function onHideTopDrop(conversation) {
  if (conversation) {
    return (conversation.isShowTopDrop = false);
  }
  let tops = state.tops;
  tops.map(item => {
    item.isShowTopDrop = false;
  });
}
function onConversation(item, index) {
  state.conversations.map((conversation, i) => {
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
  state.currentConversation = item;
  clearUnreadCount(item, index);
}
emitter.$on(EVENT_NAME.ON_GROUP_CREATED, ({ conversation }) => {
  state.currentConversation = conversation;
});
emitter.$on(EVENT_NAME.ON_GROUP_MEMBER_ADDED, ({ conversation }) => {
  updateConversation(conversation);
});
emitter.$on(EVENT_NAME.ON_GROUP_MEMBER_REMOVED, ({ conversation }) => {
  updateConversation(conversation);
});

function updateConversation(conversation) {
  utils.extend(state.currentConversation, conversation);
  utils.forEach(state.conversations, item => {
    if (
      utils.isEqual(item.conversationId, conversation.conversationId) &&
      messageUtils.isGroup(item)
    ) {
      utils.extend(item, conversation);
    }
  });
}

function clearUnreadCount(item, index) {
  let conversation = state.conversations[index];
  conversation.unreadCount = 0;
  let { conversationId, conversationType, latestUnreadIndex } = item;
  juggle.clearUnreadcount({
    conversationId,
    conversationType,
    unreadIndex: latestUnreadIndex
  });
}

let user = Storage.get(STORAGE.USER_TOKEN);
if (utils.isEmpty(user)) {
  router.replace({ name: "Login" });
}

im.connect(user, {
  success: _user => {
    console.log("conversation connect success", _user);
    let isFirst = true;
    getConversations(isFirst);
    conversationTools.getTops(state);
    utils.extend(state.currentUser, user);
  },
  error: () => {
    router.replace({ name: "Login" });
  }
});

juggle.once(Event.CONVERSATION_CHANGED, onConversationChanged);
juggle.once(Event.CONVERSATION_ADDED, onConversationChanged);
juggle.once(Event.CONVERSATION_TOP, onConversationTop);
juggle.once(Event.CONVERSATION_REMOVED, onConversationRemove);
function onConversationChanged({ conversations }) {
  return conversationHandler(conversations, state);
}
function onConversationTop({ conversations }){
  return conversationTopHandler(conversations, state);
}
function onConversationRemove({ conversations }){
  return conversationRemoveHandler(conversations, state);
}
function getConversations(isFirst = false, callback = utils.noop) {
  let params = {};
  if (!isFirst) {
    let index = state.conversations.length - 1;
    let item = state.conversations[index];
    params = { time: item.sortTime };
  }

  juggle.getConversations(params).then(result => {
    let { conversations: _list } = result;
    console.log("conversatoins", _list);
    utils.forEach(_list, conversation => {
      let {
        latestMessage,
        conversationPortrait,
        conversationTitle = ""
      } = conversation;
      let { sentTime } = latestMessage;
      let f_time = common.getConversationTime(sentTime);
      if (!sentTime) {
        f_time = "";
      }
      conversation = common.formatMention(conversation);
      let shortName = im.msgShortFormat(latestMessage);
      conversationPortrait =
        conversationPortrait || common.getTextAvatar(conversationTitle);
      utils.extend(conversation, {
        f_time,
        isShowDrop: false,
        isActive: false,
        shortName,
        conversationPortrait
      });
      let index = utils.find(state.conversations, item => {
        return (
          utils.isEqual(item.conversationType, conversation.conversationType) &&
          utils.isEqual(item.conversationId, conversation.conversationId)
        );
      });
      if (utils.isEqual(index, -1)) {
        state.conversations.push(conversation);
      } else {
        state.conversations.splice(index, 1, conversation);
      }
    });
    callback();
  });
}

conversationTools.insertTempConversation(query, state);

function onMarkUnread(index) {
  return conversationTools.markUnread(index, state);
}
function onRemoveConversation(index) {
  return conversationTools.removeConversation(index, state);
}
function onClearMessages(index) {
  let conversation = state.conversations[index];
  state.currentConversation = {};
  return conversationTools.clearMessages(conversation);
}

function onDraft(conversation) {
  return conversationTools.updateDraft({ conversation, conversations: state.conversations });
}

function onSetConversationTop(item, isTop) {
  let { tops, conversations } = state;
  return conversationTools.setConversationTop({ item, isTop, tops, conversations });
}

function onConversationDisturb(item){
  return conversationTools.conversationDisturb(item);
}

function onNavChat(item) {
  juggle.getConversation(item).then(({ conversation }) => {
    let {
      conversationId,
      conversationType,
      latestMessage,
      unreadCount
    } = conversation;
    let index = utils.find(state.conversations, item => {
      return (
        utils.isEqual(item.conversationType, conversationType) &&
        utils.isEqual(item.conversationId, conversationId)
      );
    });
    if (utils.isEqual(index, -1)) {
      common.formatMention(conversation);
      let shortName = im.msgShortFormat(latestMessage);
      let { sentTime } = latestMessage;
      let f_time = common.getConversationTime(sentTime);
      if (!sentTime) {
        f_time = "";
      }
      utils.extend(conversation, {
        f_time,
        isShowDrop: false,
        shortName,
        latestMessage: latestMessage,
        unreadCount
      });
    } else {
      conversation = state.conversations.splice(index, 1)[0];
    }
    conversation = utils.clone(conversation);
    state.conversations.unshift(conversation);
    onConversation(conversation, 0);
  });
}
let context = getCurrentInstance();

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
      getConversations(isFirst, () => {
        canscroll = true;
      });
    }
  });
});

function onShowConversationGroup(){
  let { isShowConversationGroup } = state;
  state.isShowConversationGroup = !isShowConversationGroup;
}
function onShowGroupMemberManager(isShow){
  state.isShowGroupMemberManager = isShow;
}
function onGroupChange(item){
  console.log(item)
}
</script>
<template>
  <div class="tyn-content">
    <div class="tyn-aside">
      <AisdeHeader @onnav="onNavChat"></AisdeHeader>
      <ModalGroupMember :is-show="state.isShowGroupMemberManager" @oncancel="onShowGroupMemberManager(false)"></ModalGroupMember>
      <div class="jg-conversation-body">
        <ConversationGroup :is-show="state.isShowConversationGroup" @onchange="onGroupChange"></ConversationGroup>
        <div class="jg-conver-list" :class="[state.isShowConversationGroup ? 'show-group-conver' : '']" >
          <div class="jg-conversations-header" v-if="!juggle.isDesktop()">
            <ul class="jg-conversations-tools jg-convers-tools">
              <li class="jg-conversation-tool wr" :class="[state.isShowConversationGroup ? 'wr-menu-left' : 'wr-menu-right']" @click="onShowConversationGroup()">消息</li>
              <li class="jg-conversation-tool wr wr-menu-modify" @click="onShowGroupMemberManager(true)">会话设置</li>
            </ul>
          </div>
          <div class="tyn-aside-toplist" v-if="state.tops.length">
            <div
              class="tyn-aside-topitem"
              v-for="(item, index) in state.tops"
              @mouseleave="onHideTopDrop()"
              @click="onConversation(item)"
            >
              <div
                class="tyn-avatar tyn-topitem-avatar"
                :style="{'background-image': 'url(' + item.conversationPortrait + ')'}"
                @click.right.prevent="onShowTopDropmenu(index)"
              ></div>
              <div class="tyn-topitem-name">{{ item.conversationTitle || 'JG' }}</div>
              <ul class="tyn-media-option-list">
                <li class="dropdown">
                  <div class="dropdown-menu" :class="{ 'show jg-topmenu-show': item.isShowTopDrop }">
                    <ul class="tyn-list-links">
                      <li>
                        <a class="wr wr-untop" @click.stop="onSetConversationTop(item, false)">
                          <span>取消置顶</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="tyn-aside-body" ref="conversations">
            <div class="tab-content">
              <div class="tab-pane show active">
                <ul class="tyn-aside-list">
                  <li
                    class="tyn-aside-item js-toggle-main"
                    v-for="(item, index) in state.conversations"
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
                <div class="tyn-aside-row text-center" v-if="state.conversations.length == 0">
                  <h6>没有记录</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <None v-if="utils.isEmpty(state.currentConversation)"></None>
    <Conversation :conversation="state.currentConversation" v-if="!utils.isEmpty(state.currentConversation)" @ondraft="onDraft" ></Conversation>
  </div>
</template>