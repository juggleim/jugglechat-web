<script setup>
import utils from "../../common/utils";
import { reactive, getCurrentInstance, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import Conversation from "./conversation.vue";
import Avatar from "../../components/avatar.vue";
import None from "./none.vue";

import { STORAGE, EVENT_NAME, CONVERATION_TAG_ID, CONVERSATION_TAG_TYPE } from "../../common/enum";
import Storage from "../../common/storage";
import im from "../../common/im";
import common from "../../common/common";
import emitter from "../../common/emmit";
import messageUtils from "../../components/message-utils";
import conversationTools from "./conversation";
import ConversationGroup from './conversation-group.vue';
import ModalGroupMember from '../../components/modal-groups-member.vue';
import ConversationRightMenu from "../../components/conversation-menu.vue";
import conversationHandler from "./conversation-handler";
import conversationTopHandler from "./conversation-top-handler";
import conversationRemoveHandler from "./conversation-remove-handler";
import ConversationBody from "./conversation-body.vue";
import H5TBar from "./conversation-tbar.vue";
import H5Header from "./conversation-header.vue";

/* 
会话列表支持多分组
1、优先展示全部会话列表，其他分组引用全部会话分组的会话，相同引用只需修改一次
2、如果全部会话没有包含的会话，单独更新
*/
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
  conversationMap: {},
  currentTag: { id: CONVERATION_TAG_ID.ALL },
  i18n: common.i18n(),
});

emitter.$on(EVENT_NAME.ON_APP_LANGUAGE_CHANGED, () => {
  utils.extend(state, {
    i18n: common.i18n()
  })
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
    shortName: common.i18n().MAIN.NEW_FRIEND,
  }
  onConversationChanged({ conversations: [conversation] })
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
function onConversation(conversation){
  if(!conversationTools.isSame(state.currentConversation, conversation)){
    state.currentConversation = conversation;
  }
}
emitter.$on(EVENT_NAME.ON_CONVERSATION_RESET, () => {
  state.currentConversation = {};
});
emitter.$on(EVENT_NAME.ON_CONVERSATION_SEARCH_NAV, ({ conversation }) => {
  state.currentConversation = conversation;
  onConversationChanged({ conversations: [conversation], state });
});
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

let user = Storage.get(STORAGE.USER_TOKEN);
if (utils.isEmpty(user)) {
  router.replace({ name: "Login" });
}

im.connect(user, {
  success: async (_user) => {
    console.log("conversation connect success", _user);
    // let { tags = [] } = await juggle.getConversationTags();
    let tags = [{id: CONVERATION_TAG_ID.ALL, name: common.i18n().MAIN.CHAT}]
    utils.forEach(tags, (tag) => {
      let map = {};
      map[tag.id] = [];
      utils.extend(state.conversationMap, map);
    })
    let isFirst = true;
    getConversations(isFirst, CONVERATION_TAG_ID.ALL);
    conversationTools.getTops(state);
    utils.extend(state.currentUser, user);
  },
  error: () => {
    router.replace({ name: "Login" });
  }
});

juggle.on(Event.CONVERSATION_CHANGED, onConversationChanged);
juggle.on(Event.CONVERSATION_ADDED, onConversationChanged);
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
function getConversations(isFirst = false, tag, callback = utils.noop) {
  let params = {};
  if (!isFirst) {
    let index = state.conversationMap[tag].length - 1;
    let item = state.conversationMap[tag][index];
    params = { time: item.sortTime };
  }
  utils.extend(params, { tag });

  //临时代码：和服务端约定获取全部规则后可删除
  if(utils.isEqual(tag, CONVERATION_TAG_ID.ALL)){
    params.tag = '';
  }
  juggle.getConversations(params).then(result => {
    let { conversations: _list } = result;
    _list = common.filterIgnoreConversations(_list);
    console.log("conversatoins", _list);
    utils.forEach(_list, conversation => {
      let {
        latestMessage,
        conversationTitle = ""
      } = conversation;
      let { sentTime } = latestMessage;
      let f_time = common.getConversationTime(sentTime);
      if (!sentTime) {
        f_time = "";
      }
     
      let converMention = common.formatMention(conversation);
      let shortName = im.msgShortFormat(latestMessage);
      shortName = converMention +  shortName;

      utils.extend(conversation, {
        f_time,
        isShowDrop: false,
        isActive: false,
        shortName,
      });
      if(!state.conversationMap[tag]){
        state.conversationMap[tag] = [];
      }
      let index = utils.find(state.conversationMap[tag], item => {
        return (
          utils.isEqual(item.conversationType, conversation.conversationType) &&
          utils.isEqual(item.conversationId, conversation.conversationId)
        );
      });
      if (utils.isEqual(index, -1)) {
        state.conversationMap[tag].push(conversation);
      } else {
        state.conversationMap[tag].splice(index, 1, conversation);
      }
    });
    if(utils.isEmpty(_list) && !state.conversationMap[tag]){
      state.conversationMap[tag] = _list;
    }
    callback();
  });
}

function onLoadMore({ tag, callback }){
  let isFirst = false;
  getConversations(isFirst, tag, callback);
}

conversationTools.insertTempConversation(query, state);

function onMarkUnread(index) {
  return conversationTools.markUnread(index, state);
}
function onRemoveConversation(index) {
  return conversationTools.removeConversation(index, state);
}
function onClearMessages(index) {
  let conversation = index;
  if(!isNaN(Number(index))){
    conversation = state.conversationMap[state.currentTag.id][index];
  }
  state.currentConversation = {};
  return conversationTools.clearMessages(conversation);
}

function onQuitGroup(conversation){
  state.currentConversation = {};
}

function onDraft(conversation) {
  let { currentTag } = state;
  let conversations = state.conversationMap[currentTag.id];
  return conversationTools.updateDraft({ conversation, conversations });
}

function onBack(){
  state.currentConversation = {};
}

function onSetConversationTop(item, isTop) {
  let { tops, conversations } = state;
  return conversationTools.setConversationTop({ item, isTop, tops, conversations });
}

function onConversationDisturb(item){
  return conversationTools.conversationDisturb(item);
}

let context = getCurrentInstance();

function onShowConversationGroup(){
  let { isShowConversationGroup } = state;
  state.isShowConversationGroup = !isShowConversationGroup;
}
function onShowGroupMemberManager(isShow){
  state.isShowGroupMemberManager = isShow;
}
function onGroupChange({ item }){
  state.currentTag = item;
  let isFirst = true;
  getConversations(isFirst, item.id);
}
function onTagConversationChanged({ removes, adds, tag }){
  let tagId = tag.id;
  if(adds.length > 0){
    let params = {
      id: tagId,
      conversations: adds
    }
    juggle.addConversationsToTag(params);

    let conversations = state.conversationMap[tagId] || [];

    adds = utils.map(adds, (item) => {
      let { latestMessage } = item;
      let  f_content = common.formatMention(item);

      let shortName = im.msgShortFormat(latestMessage);
      shortName = f_content + shortName;
      
      let { sentTime } = latestMessage;
      let f_time = common.getConversationTime(sentTime);
      if (!sentTime) {
        f_time = "";
      }
      utils.extend(item, {
        f_time,
        isShowDrop: false,
        isActive: false,
        shortName
      });
      return item;
    })

    let list = conversations.concat(adds);
    state.conversationMap[tagId] = list.sort((a, b) => {
      return a.sortTime > b.sortTime;
    })
  }

  if(removes.length > 0){
    let params = {
      id: tagId,
      conversations: removes
    }
    juggle.removeConversationsFromTag(params);
    let conversations = state.conversationMap[tagId] || [];
    utils.forEach(removes, (item) => {
      let index = utils.find(conversations, (conversation) => {
        return utils.isEqual(conversation.conversationId, item.conversationId);
      });
      if(index > -1){
        conversations.splice(index, 1);
      }
    });
  }
  state.isShowGroupMemberManager = false;
}

</script>
<template>
  <div class="tyn-content" :class="{'tyn-content-active': !utils.isEmpty(state.currentConversation)}">
    <div class="tyn-aside">
      <H5Header></H5Header>
      <div class="jg-conversation-body">
        <ConversationGroup :is-show="state.isShowConversationGroup" @onchange="onGroupChange"></ConversationGroup>
        <div class="jg-conver-list" :class="[state.isShowConversationGroup ? 'show-group-conver' : '']" >

          <div class="jg-conversations-header">
            <ul class="jg-conversations-tools jg-convers-tools">
              <li class="jg-conversation-tool wr" :class="[state.isShowConversationGroup ? 'wr-menu-left' : 'wr-menu-right']" @click="onShowConversationGroup()">{{ state.i18n.MAIN.CHAT }}</li>
              <li class="jg-conversation-tool wr wr-menu-modify" @click="onShowGroupMemberManager(true)" v-if="state.currentTag.type == CONVERSATION_TAG_TYPE.CUSTOM">{{ state.i18n.MAIN.CHAT_SETTING }}</li>
            </ul>
          </div>

          <div class="tyn-aside-toplist" v-if="state.tops.length">
            <div
              class="tyn-aside-topitem"
              v-for="(item, index) in state.tops"
              @mouseleave="onHideTopDrop()"
              @click="onConversation(item)"
            >
              <Avatar 
                :cls="'tyn-topitem-avatar tyn-md-avatar'"
                :avatar="messageUtils.isGroup(item) ? '' :item.conversationPortrait"
                :name="item.conversationTitle"
                @click.right.prevent="onShowTopDropmenu(index)">
              </Avatar>
              <div class="tyn-topitem-name">{{ item.conversationTitle || 'JG' }}</div>
              <ul class="tyn-media-option-list">
                <li class="dropdown">
                  <div class="dropdown-menu" :class="{ 'show jg-topmenu-show': item.isShowTopDrop }">
                    <ul class="tyn-list-links">
                      <li>
                        <a class="wr wr-untop" @click.stop="onSetConversationTop(item, false)">
                          <span>{{ state.i18n.MAIN.CHAT_MENU.UNPIN }}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <ConversationBody v-for="(list, tag) in state.conversationMap"
            :style="[utils.isEqual(tag, state.currentTag.id) ? 'display: block;' : 'display: none;']"
            :conversations="list"
            :tag="tag"
            @onloadmore="onLoadMore"
            @onconversation="onConversation"
            @onhide="onHideDrop" 
            @onmark="onMarkUnread"
            @ontop="onSetConversationTop"
            @ondisturb="onConversationDisturb"
            @onremove="onRemoveConversation"
            @onclearmsg="onClearMessages">
          </ConversationBody>
        </div>
      </div>
      <!-- <H5TBar></H5TBar> -->
    </div>
    <ModalGroupMember :is-show="state.isShowGroupMemberManager" @oncancel="onShowGroupMemberManager(false)" @onconfirm="onTagConversationChanged" :tag="state.currentTag"></ModalGroupMember>
    <None v-if="utils.isEmpty(state.currentConversation)"></None>
    <Conversation :conversation="state.currentConversation" v-if="!utils.isEmpty(state.currentConversation) || utils.isMobile()" 
      @ondraft="onDraft" 
      @ontop="onSetConversationTop" 
      @ondisturb="onConversationDisturb"
      @onclearmsg="onClearMessages" 
      @onback="onBack"
      @onquitgroup="onQuitGroup">
    </Conversation>
  </div>
</template>