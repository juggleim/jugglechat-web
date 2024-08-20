<script setup>
import utils from "../../common/utils";
import { reactive } from "vue";
import { useRouter } from "vue-router";
import Conversation from "./conversation.vue";
import AisdeHeader from "../../components/aside-header.vue";
import { STORAGE, EVENT_NAME } from "../../common/enum";
import Storage from "../../common/storage";
import im from "../../common/im";
import common from "../../common/common";
import emitter from "../../common/emmit";
import messageUtils from "../../components/message-utils";
import conversationTools from "./conversation";

const router = useRouter();
let { currentRoute: { _rawValue: { query } } } = router;

let juggle = im.getCurrent();
let { UnreadTag } = juggle;
let { Event, ConnectionState, MentionType, MessageType } = juggle;

let state = reactive({
  conversations: [],
  currentConversation: {},
  currentUser: {}
});
function onShowDropmenu(index) {
  let conversation = state.conversations[index];
  conversation.isShowDrop = true;
}
function onHideDrop(conversation) {
  conversation.isShowDrop = false;
}
function onConversation(item, index) {
  state.conversations.map((conversation) => {
    let isActive = utils.isEqual(item.conversationId, conversation.conversationId);
    if(isActive){
      conversation.f_mentionContent = '';
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
  updateConversation(conversation)
});
emitter.$on(EVENT_NAME.ON_GROUP_MEMBER_REMOVED, ({ conversation }) => {
  updateConversation(conversation)
});

function updateConversation(conversation){
  utils.extend(state.currentConversation, conversation);
  utils.forEach(state.conversations, (item) => {
    if(utils.isEqual(item.conversationId, conversation.conversationId) && messageUtils.isGroup(item)){
      utils.extend(item, conversation);
    }
  })
}

function clearUnreadCount(item, index) {
  let conversation = state.conversations[index];
  conversation.unreadCount = 0;
  let { conversationId, conversationType, latestUnreadIndex } = item;
  juggle.clearUnreadcount({ conversationId, conversationType, unreadIndex: latestUnreadIndex });
}

let user = Storage.get(STORAGE.USER_TOKEN);
if (utils.isEmpty(user)) {
  router.replace({ name: 'Login' });
}
im.connect(user, {
  success: (_user) => {
    console.log('conversation connect success', _user)
    let isFirst = true;
    getConversations(isFirst);
    utils.extend(state.currentUser, user);
  },
  error: () => {
    router.replace({ name: 'Login' });
  }
});

function getConversationTime(sentTime) {
  let str = utils.getCurrentTime();
  let current = new Date(str);
  let time = utils.formatTime(sentTime, 'MM-dd hh:mm');
  if (sentTime > current) {
    time = utils.formatTime(sentTime, 'hh:mm');
  }
  return time;
}
// juggle.once(Event.CONVERSATION_CLEARUNREAD, ({ conversations }) => {
//   utils.forEach(conversations, (conver) => {
//     let index = utils.find(state.conversations, (item) => {
//       return utils.isEqual(item.conversationType, conver.conversationType) && utils.isEqual(item.conversationId, conver.conversationId);
//     });
//     if(index > -1){
//       let item = state.conversations[index];
//       clearUnreadCount(item, index);
//     }
//   })
// });
juggle.once(Event.CONVERSATION_CHANGED, ({ conversations }) => {
  utils.forEach(conversations, (conversation) => {
    console.log('conversation', conversation)
    if(conversationTools.isSameConversation(conversation, state)){
      utils.extend(state.currentConversation, conversation);
    }
    formatMention(conversation);
    let { conversations } = state;
    let { conversationId, conversationType, latestMessage, unreadCount } = conversation;
    let index = utils.find(conversations, (item) => {
      return utils.isEqual(item.conversationType, conversationType) && utils.isEqual(item.conversationId, conversationId);
    });
    if (!utils.isEqual(index, -1)) {
      let oldConversation = state.conversations[index];
      let { isActive } = oldConversation;

      if(!conversation.conversationTitle){
        let { conversationPortrait, conversationTitle } = oldConversation;
        utils.extend(conversation, { conversationPortrait, conversationTitle  });
      }

      if(latestMessage.sentTime >= oldConversation.latestMessage.sentTime){
        let shortName = im.msgShortFormat(latestMessage);
        let { sentTime } = latestMessage;
        let f_time = getConversationTime(sentTime);
        if (!sentTime) {
          f_time = '';
        }
        utils.extend(conversation, { f_time, isShowDrop: false, shortName, latestMessage: latestMessage, unreadCount });
      }else{
        utils.extend(oldConversation, { unreadCount });
      }

      utils.extend(conversation, { isActive });
      if(conversation.sortTime > oldConversation.sortTime){
        state.conversations.splice(index, 1)[0];
        state.conversations.unshift(conversation);
      }else{
        state.conversations.splice(index, 1, conversation);
      }
    }
  });
});
juggle.once(Event.CONVERSATION_ADDED, ({ conversations }) => {
  utils.forEach(conversations, (conversation) => {
    formatMention(conversation);
    let { latestMessage } = conversation;
    let shortName = im.msgShortFormat(latestMessage);
    let { sentTime } = latestMessage;
    let f_time = getConversationTime(sentTime);
    if (!sentTime) {
      f_time = '';
    }
    utils.extend(conversation, { f_time, isShowDrop: false, shortName });
    state.conversations.unshift(conversation);
  });
});
juggle.once(Event.CONVERSATION_REMOVED, ({ conversations }) => {
  utils.forEach(conversations, (conversation) => {
    let { conversations } = state;
    let { conversationId, conversationType, latestMessage, unreadCount } = conversation;
    let index = utils.find(conversations, (item) => {
      return utils.isEqual(item.conversationType, conversationType) && utils.isEqual(item.conversationId, conversationId);
    });
    state.conversations.splice(index, 1)[0];
  });
});
juggle.on(Event.STATE_CHANGED, ({ state: status }) => {
  if (ConnectionState.DISCONNECTED == status) {
    utils.extend(state, { conversations: [], currentUser: {}, currentConversation: {} })
  }
});
function formatMention(conversation) {
  let { mentions = {} } = conversation;
  let f_mentionContent = '';
  if (mentions.isMentioned) {
    f_mentionContent = '有人@我';
  }
  return utils.extend(conversation, { f_mentionContent });
}
function getConversations() {
  juggle.getConversations({}).then((result) => {
    let { conversations: _list } = result;
    console.log('conversatoins', _list)
    utils.forEach(_list, (conversation) => {
      let { latestMessage, conversationPortrait, conversationTitle = '' } = conversation;
      let { sentTime } = latestMessage;
      let f_time = getConversationTime(sentTime);
      if (!sentTime) {
        f_time = '';
      }
      conversation = formatMention(conversation);
      let shortName = im.msgShortFormat(latestMessage);
      conversationPortrait = conversationPortrait || common.getTextAvatar(conversationTitle);
      utils.extend(conversation, { f_time, isShowDrop: false, isActive: false, shortName, conversationPortrait });
      let index = utils.find(state.conversations, (item) => {
        return utils.isEqual(item.conversationType, conversation.conversationType) && utils.isEqual(item.conversationId, conversation.conversationId);
      });
      if (utils.isEqual(index, -1)) {
        state.conversations.push(conversation);
      }else{
        state.conversations.splice(index, 1, conversation);
      }
    });
  })
}

function insertTempConversation() {
  if (query.id) {
    common.getConversationInfo(query, (info) => {
      let { id: conversationId, type: conversationType } = query;
      conversationType = Number(conversationType);
      let index = utils.find(state.conversations, (item) => {
        return utils.isEqual(item.conversationType, conversationType) && utils.isEqual(item.conversationId, conversationId);
      });

      let message = {
        name: MessageType.TEXT,
        content: { content: '[新会话]' },
        sentTime: Date.now(),
        messageIndex: -1
      };
      if (!utils.isEqual(index, -1)) {
        var item = state.conversations.splice(index, 1)[0] || {};
        utils.extend(message, item);
      }
      let { nickname, avatar } = info;
      let conversation = {
        conversationId,
        conversationType,
        conversationTitle: nickname,
        conversationPortrait: avatar || common.getTextAvatar(nickname),
        shortName: im.msgShortFormat(message),
        latestMessage: message,
        isActive: true,
      };
      state.conversations.map((item) =>{
        item.isActive = false;
        return item;
      });
      state.conversations.unshift(conversation);
      utils.extend(state, { currentConversation: conversation })
    });
  }
}
insertTempConversation();

function onMarkUnread(index){
  let conversation = state.conversations[index];
  let { unreadTag } = conversation;
  utils.extend(conversation, {
    isShowDrop: false,
    unreadTag: UnreadTag.UNREAD,
  });

  if(utils.isEqual(unreadTag, UnreadTag.UNREAD)){
    return clearUnreadCount(conversation, index)
  }
  let { conversationId, conversationType } = conversation;
  juggle.markUnread({
    conversationId: conversationId,
    conversationType: conversationType,
    unreadTag: UnreadTag.UNREAD,
  }).then(() => {
    console.log('markunread successfully')
  }, (error) => {
    console.log(error)
  });
}
function onRemoveConversation(index) {
  let conversation = state.conversations[index];
  conversation.isShowDrop = false;
  let { conversationType, conversationId } = conversation;
  juggle.removeConversation({ conversationType, conversationId }).then(() => {
    console.log('remove conversation successfully');
  });
  // state.conversations.splice(index, 1);
  let { currentConversation } = state;
  if(utils.isEqual(currentConversation.conversationId, conversation.conversationId)){
    utils.extend(state, { currentConversation: {} });
    router.push({ name: 'ConversationList' })
  }
  
}
function onClearMessages(index) {
  let conversation = state.conversations[index];
  utils.extend(conversation, {
    isShowDrop: false,
    unreadCount: 0
  });
  state.currentConversation = {};

  let params = {
    conversationType: conversation.conversationType,
    conversationId: conversation.conversationId,
    time: conversation.latestMessage.sentTime
  };
  juggle.clearMessage(params).then(() => {
    console.log('clear messages successfully');
  }, (error) => {
    console.log(error);
  });
}

function isSameConversation(origin, source) {
  return utils.isEqual(origin.conversationId, source.conversationId) && utils.isEqual(origin.conversationType, source.conversationType);
}
function onDraft(conversation) {
  let { draft } = conversation;

  let index = utils.find(state.conversations, (item) => {
    return isSameConversation(item, conversation);
  });
  if(utils.isEqual(index, -1)){
    return;
  }
  utils.extend(state.conversations[index], { draft })
  if (utils.isEmpty(draft)) {
    juggle.removeDraft(conversation);
  } else {
    juggle.setDraft(conversation);
  }
}

function onNavChat(item){
  juggle.getConversation(item).then(({ conversation }) => {
    let { conversationId, conversationType, latestMessage, unreadCount } = conversation;
    let index = utils.find(state.conversations, (item) => {
      return utils.isEqual(item.conversationType, conversationType) && utils.isEqual(item.conversationId, conversationId);
    });
    if(utils.isEqual(index, -1)){
      formatMention(conversation);
      getConversationTime
      let shortName = im.msgShortFormat(latestMessage);
      let { sentTime } = latestMessage;
      let f_time = getConversationTime(sentTime);
      if (!sentTime) {
        f_time = '';
      }
      utils.extend(conversation, { f_time, isShowDrop: false, shortName, latestMessage: latestMessage, unreadCount });
    }else{
      conversation = state.conversations.splice(index, 1)[0];
    }
    conversation = utils.clone(conversation);
    state.conversations.unshift(conversation);
    onConversation(conversation, 0)
  });
}
</script>
<template>
  <div class="tyn-content tyn-content-full-height tyn-chat has-aside-base">
    <div class="tyn-aside">
      <AisdeHeader :title="'消息'" @onnav="onNavChat"></AisdeHeader>
      <div class="tyn-aside-body" data-simplebar>
        <div class="tab-content">
          <div class="tab-pane show active">
            <ul class="tyn-aside-list">
              <li class="tyn-aside-item js-toggle-main" v-for="(item, index) in state.conversations"
                :class="{ 'active': item.isActive }" @click="onConversation(item, index)">
                <div class="tyn-media-group">
                  <div class="tyn-media tyn-size-lg">
                    <div class="tyn-avatar tyn-s-avatar position-relative tyn-circle"
                      :style="{ 'background-image': 'url(' + item.conversationPortrait + ')' }">
                      <div class="badge bg-danger position-absolute rounded-pill top-0 end-0 mt-n2 me-n2"
                        v-if="item.unreadCount > 0">{{ item.unreadCount }}</div>
                      <div class="badge bg-danger position-absolute rounded-pill top-0 end-0 mt-n2 me-n2"
                        v-if="item.unreadCount == 0 && item.unreadTag">1</div>
                    </div>
                  </div>
                  <div class="tyn-media-col">
                    <div class="tyn-media-row">
                      <h6 class="name">{{ item.conversationTitle }}</h6>
                      <span class="typing" v-if="item.isTyping">typing ...</span>
                    </div>
                    <div class="tyn-media-row has-dot-sap between">
                      <p class="content wr" v-if="item.draft" :class="{ 'wr-modify-pen content-draft': item.draft }">{{
        item.draft }}</p>
                      <p class="content" v-else>
                        <span class="text-danger lastmsg-mention" v-if="item.f_mentionContent != ''">{{ item.f_mentionContent }}</span>{{ item.shortName }}
                      </p>
                      <span class="meta">{{ item.f_time }}</span>
                    </div>
                  </div>
                  <div class="tyn-media-option tyn-aside-item-option">
                    <ul class="tyn-media-option-list">
                      <li class="dropdown">
                        <button class="btn btn-icon btn-white btn-pill dropdown-toggle wr wr-category"
                          data-bs-toggle="dropdown" data-bs-offset="0,0" data-bs-auto-close="outside"
                          @click.stop="onShowDropmenu(index)">
                        </button>
                        <div class="dropdown-menu dropdown-menu-end" :class="{ 'show jg-cndrop-show': item.isShowDrop }"
                          @mouseleave="onHideDrop(item)">
                          <ul class="tyn-list-links">
                            <li>
                              <a class="wr wr-read" @click.stop="onMarkUnread(index)">
                                <span>{{ item.unreadTag ? '清理未读' : '标记未读' }}</span>
                              </a>
                            </li>
                            <li class="dropdown-divider"></li>
                            <li>
                              <a class="wr wr-delete" data-bs-toggle="modal" @click.stop="onRemoveConversation(index)">
                                <span>删除会话</span>
                              </a>
                            </li>
                            <li>
                              <a href="#" class="wr wr-clear" @click.stop="onClearMessages(index)">
                                <span>清空消息</span>
                              </a>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
            <div class="tyn-aside-row text-center" v-if="state.conversations.length == 0">
              <h6>没有记录</h6>
            </div>
          </div>
        </div>
        <!-- .tab-content -->
      </div>
      <!-- .tyn-aside-body -->
    </div>
    <Conversation :conversation="state.currentConversation" v-if="!utils.isEmpty(state.currentConversation)"
      @ondraft="onDraft"></Conversation>
  </div>
</template>