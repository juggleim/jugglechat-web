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
  currentRightIndex: -1,
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
  console.log(state.dropmenuX)

  let conversation = state.conversations[index];
  state.currentRightIndex = index;
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
    getTops();
    utils.extend(state.currentUser, user);
  },
  error: () => {
    router.replace({ name: "Login" });
  }
});

function getConversationTime(sentTime) {
  let str = utils.getCurrentTime();
  let current = new Date(str);
  let time = utils.formatTime(sentTime, "MM-dd hh:mm");
  if (sentTime > current) {
    time = utils.formatTime(sentTime, "hh:mm");
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
juggle.once(Event.CONVERSATION_CHANGED, converationHandler);
juggle.once(Event.CONVERSATION_ADDED, converationHandler);

juggle.once(Event.CONVERSATION_REMOVED, ({ conversations }) => {
  utils.forEach(conversations, conversation => {
    let { conversations } = state;
    let {
      conversationId,
      conversationType,
      latestMessage,
      unreadCount
    } = conversation;
    let index = utils.find(conversations, item => {
      return (
        utils.isEqual(item.conversationType, conversationType) &&
        utils.isEqual(item.conversationId, conversationId)
      );
    });
    state.conversations.splice(index, 1)[0];
  });
});
function converationHandler({ conversations }) {
  utils.forEach(conversations, conversation => {
    console.log("conversation", conversation);

    if (!conversation.latestMessage) {
      return;
    }
    formatMention(conversation);
    let { conversations } = state;
    let {
      conversationId,
      conversationType,
      latestMessage,
      unreadCount
    } = conversation;
    let index = utils.find(conversations, item => {
      return (
        utils.isEqual(item.conversationType, conversationType) &&
        utils.isEqual(item.conversationId, conversationId)
      );
    });
    if (!utils.isEqual(index, -1)) {
      let oldConversation = state.conversations[index];
      let { isActive } = oldConversation;

      if (!conversation.conversationTitle) {
        let { conversationTitle } = oldConversation;
        utils.extend(conversation, { conversationTitle });
      }

      if (!conversation.conversationPortrait) {
        let { conversationPortrait } = oldConversation;
        utils.extend(conversation, { conversationPortrait });
      }

      if (latestMessage.sentTime >= oldConversation.latestMessage.sentTime) {
        let shortName = im.msgShortFormat(latestMessage);
        let { sentTime } = latestMessage;
        let f_time = getConversationTime(sentTime);
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
        utils.extend(oldConversation, { unreadCount });
      }

      utils.extend(conversation, { isActive });
      if (conversation.sortTime > oldConversation.sortTime) {
        state.conversations.splice(index, 1)[0];
        state.conversations.unshift(conversation);
      } else {
        state.conversations.splice(index, 1, utils.clone(conversation));
      }
    } else {
      let { latestMessage } = conversation;
      let shortName = im.msgShortFormat(latestMessage);
      let { sentTime } = latestMessage;
      let f_time = getConversationTime(sentTime);
      if (!sentTime) {
        f_time = "";
      }
      utils.extend(conversation, { f_time, isShowDrop: false, shortName });
      state.conversations.unshift(conversation);
    }

    if (conversationTools.isSameConversation(conversation, state)) {
      utils.extend(state.currentConversation, conversation);
    }
  });
}
// juggle.on(Event.STATE_CHANGED, ({ state: status }) => {
//   if (ConnectionState.DISCONNECTED == status) {
//     utils.extend(state, { conversations: [], currentUser: {}, currentConversation: {} })
//   }
// });
function formatMention(conversation) {
  let { mentions = {} } = conversation;
  let f_mentionContent = "";
  if (mentions.isMentioned) {
    f_mentionContent = "有人@我";
  }
  return utils.extend(conversation, { f_mentionContent });
}
function getTops() {
  juggle.getTopConversations().then(result => {
    let { conversations, isFinished } = result;
    conversations = utils.map(conversations, item => {
      let { conversationPortrait, conversationTitle } = item;
      item.conversationPortrait =
        conversationPortrait || common.getTextAvatar(conversationTitle);
      return item;
    });
    state.tops = conversations;
  });
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
      let f_time = getConversationTime(sentTime);
      if (!sentTime) {
        f_time = "";
      }
      conversation = formatMention(conversation);
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

function insertTempConversation() {
  if (query.id) {
    common.getConversationInfo(query, info => {
      let { id: conversationId, type: conversationType } = query;
      conversationType = Number(conversationType);
      let index = utils.find(state.conversations, item => {
        return (
          utils.isEqual(item.conversationType, conversationType) &&
          utils.isEqual(item.conversationId, conversationId)
        );
      });

      let message = {
        name: MessageType.TEXT,
        content: { content: "[新会话]" },
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
        isActive: true
      };
      state.conversations.map(item => {
        item.isActive = false;
        return item;
      });
      console.log("insert new converation", conversation);
      state.conversations.unshift(conversation);
      utils.extend(state, { currentConversation: conversation });
    });
  }
}
insertTempConversation();

function onMarkUnread(index) {
  let conversation = state.conversations[index];
  let { unreadTag } = conversation;
  utils.extend(conversation, {
    isShowDrop: false,
    unreadTag: UnreadTag.UNREAD
  });

  if (utils.isEqual(unreadTag, UnreadTag.UNREAD)) {
    return clearUnreadCount(conversation, index);
  }
  let { conversationId, conversationType } = conversation;
  juggle
    .markUnread({
      conversationId: conversationId,
      conversationType: conversationType,
      unreadTag: UnreadTag.UNREAD
    })
    .then(
      () => {
        console.log("markunread successfully");
      },
      error => {
        console.log(error);
      }
    );
}
function onRemoveConversation(index) {
  let conversation = state.conversations[index];
  conversation.isShowDrop = false;
  let { conversationType, conversationId } = conversation;
  juggle.removeConversation({ conversationType, conversationId }).then(() => {
    console.log("remove conversation successfully");
  });
  // state.conversations.splice(index, 1);
  let { currentConversation } = state;
  if (
    utils.isEqual(
      currentConversation.conversationId,
      conversation.conversationId
    )
  ) {
    utils.extend(state, { currentConversation: {} });
    router.push({ name: "ConversationList" });
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
  juggle.clearMessage(params).then(
    () => {
      console.log("clear messages successfully");
    },
    error => {
      console.log(error);
    }
  );
}

function isSameConversation(origin, source) {
  return (
    utils.isEqual(origin.conversationId, source.conversationId) &&
    utils.isEqual(origin.conversationType, source.conversationType)
  );
}
function onDraft(conversation) {
  let { draft } = conversation;

  let index = utils.find(state.conversations, item => {
    return isSameConversation(item, conversation);
  });
  if (utils.isEqual(index, -1)) {
    return;
  }
  utils.extend(state.conversations[index], { draft });
  if (utils.isEmpty(draft)) {
    juggle.removeDraft(conversation);
  } else {
    juggle.setDraft(conversation);
  }
}

function onSetConversationTop(item, isTop) {
  let { tops, conversations } = state;
  let topIndex = utils.find(tops, top => {
    return utils.isEqual(top.conversationId, item.conversationId);
  });
  if (topIndex > -1) {
    tops[topIndex].isShowTopDrop = false;
    tops.splice(topIndex, 1);
  } else {
    tops.push(item);
  }

  let conversationIndex = utils.find(conversations, conver => {
    return utils.isEqual(conver.conversationId, item.conversationId);
  });

  if (conversationIndex > -1) {
    conversations[conversationIndex].isShowDrop = false;
    conversations[conversationIndex].isTop = isTop;
  }

  let _item = {
    conversationType: item.conversationType,
    conversationId: item.conversationId,
    isTop
  };
  juggle.setTopConversation(_item).then(() => {
    console.log("set conversation top successfully", _item);
  });
}

function onConversationDisturb(item){
  let conversation = { conversationId: item.conversationId, conversationType: item.conversationType, undisturbType: UndisturbType.DISTURB };
  if(utils.isEqual(item.undisturbType, UndisturbType.DISTURB)){
    conversation.undisturbType = UndisturbType.UNDISTURB;
    return juggle.disturbConversation(conversation).then(() => {
      console.log('set conversation disturb successfully');
    });
  }
  juggle.disturbConversation(conversation).then(() => {
    console.log('set conversation disturb successfully');
  });
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
      formatMention(conversation);
      getConversationTime;
      let shortName = im.msgShortFormat(latestMessage);
      let { sentTime } = latestMessage;
      let f_time = getConversationTime(sentTime);
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

watch(() => state.currentRightIndex, (value) => {
  let isCNDropMenuScrollTop = true;
  let conversation = state.conversations[value];
  if(conversation.isShowDrop){
    isCNDropMenuScrollTop = isScrollTop(value)
  }
  utils.extend(state, { isCNDropMenuScrollTop });
})

function isScrollTop(index){
  var chatNode = document.querySelector('.tyn-aside-list');
  var node = document.querySelector(`.tyn-aside-item[index="${index}"]`);
  let num = chatNode.offsetTop-node.getBoundingClientRect().bottom;
  return Math.abs(num) > 300;
}
</script>
<template>
  
  <div class="tyn-content tyn-content-full-height tyn-chat has-aside-base">
    <div class="tyn-aside">
      <AisdeHeader :title="'消息'" @onnav="onNavChat"></AisdeHeader>
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
                @click.right.prevent="onShowDropmenu"
                @mouseleave="onHideDrop(item)"
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
                <ul class="tyn-media-option-list">
                  <li class="dropdown">
                    <div
                      class="dropdown-menu dropdown-menu-end"
                      :class="{ 'show jg-cndrop-show': item.isShowDrop }"
                      @mouseleave="onHideDrop(item)"
                      :style="['left:' + state.dropmenuX + 'px', state.isCNDropMenuScrollTop ? 'bottom: 0px' : '']"
                    >
                      <ul class="tyn-list-links">
                        <li class="tyn-list-link">
                          <a class="wr wr-read" @click.stop="onMarkUnread(index)">
                            <span>{{ item.unreadTag ? '清理未读' : '标记未读' }}</span>
                          </a>
                        </li>
                        <li class="tyn-list-link">
                          <a
                            class="wr wr-top"
                            :class="{'wr-untop': item.isTop}"
                            data-bs-toggle="modal"
                            @click.stop="onSetConversationTop(item, !item.isTop)"
                          >
                            <span>{{ item.isTop ? '取消置顶' : '置顶会话' }}</span>
                          </a>
                        </li>
                        <li class="tyn-list-link">
                          <a
                            class="wr wr-mute"
                            :class="{'wr-unmute': utils.isEqual(item.undisturbType, UndisturbType.UNDISTURB)}"
                            data-bs-toggle="modal"
                            @click.stop="onConversationDisturb(item)"
                          >
                            <span>{{ utils.isEqual(item.undisturbType, UndisturbType.UNDISTURB) ? '免 打 扰' : '取消免打扰' }}</span>
                          </a>
                        </li>
                        <li class="dropdown-divider"></li>
                        <li class="tyn-list-link">
                          <a
                            class="wr wr-delete"
                            data-bs-toggle="modal"
                            @click.stop="onRemoveConversation(index)"
                          >
                            <span>删除会话</span>
                          </a>
                        </li>
                        <li class="tyn-list-link">
                          <a href="#" class="wr wr-clear" @click.stop="onClearMessages(index)">
                            <span>清空消息</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
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
    <None v-if="utils.isEmpty(state.currentConversation)"></None>
    <Conversation
      :conversation="state.currentConversation"
      v-if="!utils.isEmpty(state.currentConversation)"
      @ondraft="onDraft"
    ></Conversation>
  </div>
</template>