<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../../common/utils";
import AsideFile from "./aside-file.vue";
import AsideImage from "./aside-image.vue";
import AsideVideo from "./aside-video.vue";
import im from "../../common/im";
import ModalAddMemberGroup from "../../components/modal-add-member-group.vue";
import ModalRemoveMemberGroup from "../../components/modal-remove-member-group.vue";
import { Group } from "../../services/index";
import messageUtils from "../../components/message-utils";
import Storage from "../../common/storage";
import common from "../../common/common";
import { STORAGE, GROUP_CHANGE_TYPE, MSG_NAME, EVENT_NAME } from "../../common/enum";
import emitter from "../../common/emmit";

const props = defineProps(["isShow", "conversation", "members"]);
const context = getCurrentInstance();
let juggle = im.getCurrent();
let { MessageType, ConversationType } = juggle;
let defaultMsgs = {
  image: { msgs: [], isFinished: false },
  file: { msgs: [], isFinished: false },
  video: { msgs: [], isFinished: false },
}
let state = reactive({
  menus: [
    // { name: '操作', icon: 'operate', type: 'operate', isActive: true},
    // { name: '消息', icon: 'message', type: 'message', isActive: false},
  ],
  msgMenus: [
    { name: '图片', type: 'image', isActive: true },
    { name: '视频', type: 'video', isActive: false },
    { name: '文件', type: 'file', isActive: false },
  ],
  members: [],
  ...utils.clone(defaultMsgs),
  isShowFriend: false,
  isCreateGroupLoading: false,
  isGroupRemoveMemberLoading: false,
  currentGroupId: '',
  groupName: props.conversation.conversationTitle,
});

function onMenuTab(menu) {
  state.menus.map((_menu) => {
    _menu.isActive = utils.isEqual(_menu.type, menu.type);
    return _menu;
  });
}
function onMsgMenuTab(menu) {
  state.msgMenus.map((_menu) => {
    _menu.isActive = utils.isEqual(_menu.type, menu.type);
    return _menu;
  });
  let { type } = menu;
  let params = {
    image: { name: MessageType.IMAGE, type },
    video: { name: MessageType.VIDEO, type },
    file: { name: MessageType.FILE, type },
  };
  let param = params[type];
  let { isFinished } = state[type];
  if (isFinished) {
    return;
  }
  if (!juggle.isConnected()) {
    return;
  }
  getMessages(param, (tabType, result) => {
    let { isFinished, messages } = result;
    let msgs = state[tabType].msgs;
    msgs = msgs.concat(messages);
    utils.extend(state[tabType], { msgs, isFinished });
  });
}

function getMessages(params, callback) {
  let { name, type } = params;
  let { msgs } = state[type];
  let { sentTime: time } = msgs[msgs.length - 1] || { sentTime: 0 };
  juggle.getMessages({
    conversationId: props.conversation.conversationId,
    conversationType: props.conversation.conversationType,
    count: 20,
    time: time,
    names: [name]
  }).then((result) => {
    callback(type, result);
  });
}
// function isShowParentTab(type){
//   let menu = state.menus.filter((menu) => { return utils.isEqual(menu.type, type) })[0] || {};
//   return menu.isActive;
// }
function isShowParentTab(type) {
  return utils.isEqual(type, 'message');
}
function isShowMsgTab(type) {
  let menu = state.msgMenus.filter((menu) => { return utils.isEqual(menu.type, type) })[0];
  return menu.isActive;
}
function onShowFriendAdd(isShow) {
  state.isShowFriend = isShow;
}
function onShowMemberRemove(groupId) {
  state.currentGroupId = groupId;
}
function onCancelGroupCreate() {
  onShowFriendAdd(false);
}
function onCancelRemoveGroupMember() {
  onShowMemberRemove('');
}
/* 
1、删人（内存+服务端）
2、修改头像
3、发通知
*/
function onConfirmRemoveGroupMember({ members }) {
  if (state.isGroupRemoveMemberLoading) {
    return;
  }
  state.isGroupRemoveMemberLoading = true;
  let { conversationId, conversationTitle } = props.conversation;
  if (utils.isEqual(members.length, state.members.length)) {
    return context.proxy.$toast({
      text: `留个人，不能都移除了吧～`,
      icon: 'warn'
    });
  }

  Group.removeMember({ id: conversationId, members }).then(() => {
    utils.forEach(members, (rMember) => {
      utils.forEach(state.members, (member, index) => {
        if (member && utils.isEqual(rMember.id, member.id)) {
          state.members.splice(index, 1);
        }
      })
    });

    let _members = utils.clone(state.members);
    let name = utils.map(_members, (member) => {
      return member.name;
    }).join(', ');
    
    if(name.length > 20){
      name = `${name.substr(0, 20)}...`;
    }

    // 如果修改过自定义名字不再拼接名称，通过逗号判断比较简单粗暴，准确做法需要服务端支持
    if(!utils.isInclude(conversationTitle, ',')){
      name = conversationTitle;
    }
    common.createGroupAvatar(state.members, (avatar) => {
      let group = { group_id: conversationId, group_name: name, group_portrait: avatar };
      Group.update(group).then(() => {
        let conversation = { conversationId, conversationPortrait: avatar, conversationTitle: name };
        emitter.$emit(EVENT_NAME.ON_GROUP_MEMBER_REMOVED, { conversation, members })
        onCancelRemoveGroupMember();
      });
    });
    state.isGroupRemoveMemberLoading = false;
  });
}

function onConfirmGroupCreate({ friends }) {
  if (state.isCreateGroupLoading) {
    return;
  }
  state.isCreateGroupLoading = true;

  let name = utils.map(friends, (friend) => {
    return friend.nickname;
  }).join(', ');
  if(name.length > 20){
    name = `${name.substr(0, 20)}...`;
  }

  let members = utils.filter(friends, (friend) => {
    let isOK = !friend.disabled;
    if (isOK) {
      let { user_id: id, nickname: name, avatar: portrait } = friend;
      state.members.push({ id, name, portrait });
    }
    return isOK;
  });
  let next = (group) => {
    onCancelGroupCreate();
    state.isCreateGroupLoading = false;
  };
  common.createGroupAvatar(friends, (avatar) => {
    let { conversationId, conversationTitle, conversationType } = props.conversation;
    let isGroup = utils.isEqual(conversationType, ConversationType.GROUP);
    if (isGroup) {
      // 如果修改过自定义名字不再拼接名称，通过逗号判断比较简单粗暴，准确做法需要服务端支持
      if(!utils.isInclude(conversationTitle, ',')){
        name = conversationTitle;
      }
      return Group.addMember({ id: conversationId, members }).then(() => {
        let group = { group_id: conversationId, group_name: name, group_portrait: avatar };
        Group.update(group).then(() => {
          let conversation = { conversationId, conversationPortrait: avatar, conversationTitle: name };
          emitter.$emit(EVENT_NAME.ON_GROUP_MEMBER_ADDED, { conversation, members })
          next(group);
        });
      });
    }
    Group.create({ name, avatar, members }).then((result) => {
      let { data: group } = result;
      let conversation = {
        conversationType: ConversationType.GROUP,
        conversationId: group.group_id,
        conversationTitle: name,
        conversationPortrait: avatar,
        latestMessage: {}
      };
      emitter.$emit(EVENT_NAME.ON_GROUP_CREATED, { conversation })
      next(group);
    });
  });
}

function onSaveGroup(){
  let { conversationId, conversationTitle, conversationPortrait } = props.conversation;
  let { groupName } = state;
  if(utils.isEqual(groupName, conversationTitle)){
    return;
  }
  if(utils.isEmpty(groupName)){
    state.groupName = conversationTitle
    return;
  }
  let group = { group_id: conversationId, group_name: groupName, group_portrait: conversationPortrait, is_notify: true };
  Group.update(group);
}

watch(() => props.conversation, (conversation) => {
  utils.extend(state, utils.clone(defaultMsgs))
  state.groupName = conversation.conversationTitle;
  onMsgMenuTab(state.msgMenus[0]);
  // getMembers(conversation);
});
watch(() => props.isShow, () => {
  utils.extend(state, { members: props.members });
  if(props.isShow){
    onMsgMenuTab(state.msgMenus[0]);
  }
});
</script>

<template>
  <div class="tyn-chat-content-aside show-aside" :class="[props.isShow ? 'jg-aside-show' : 'tyn-chat-content-aside']">
    <div class="tyn-media-group tyn-media-vr tyn-media-center">
      <div class="tyn-aside-members">
        <div class="tyn-aside-member" v-for="member in state.members">
          <div class="tyn-media tyn-size-md tyn-chat-aside-avatar"
            :style="{ 'background-image': 'url(' + member.portrait + ')' }"></div>
          <div class="tyn-aside-member-name">{{ member.name }}</div>
        </div>
        <div class="tyn-aside-member" @click="onShowFriendAdd(true)">
          <div class="tyn-media tyn-size-md tyn-chat-aside-avatar wr wr-plus border"></div>
          <div class="tyn-aside-member-name">添加</div>
        </div>
        <div class="tyn-aside-member" @click="onShowMemberRemove(props.conversation.conversationId)"
          v-if="utils.isEqual(props.conversation.conversationType, ConversationType.GROUP)">
          <div class="tyn-media tyn-size-md tyn-chat-aside-avatar wr wr-jian border"></div>
          <div class="tyn-aside-member-name">移除</div>
        </div>
      </div>
    </div>
    <div class="tyn-aside-row py-0 tyn-rgaside-body" v-if="utils.isEqual(props.conversation.conversationType, ConversationType.GROUP)">
      <div class="nav-tabs jg-nav-tabs nav-tabs-line">
        <ul class="jg-aside-ul">
          <li class="jg-aside-li">
            <div class="tyn-aside-title">群聊名称</div>
            <div class="tyn-media-row wr wr-modify">
              <input type="text" class="tyn-title-overline text-none" v-model="state.groupName" placeholder="输入群聊名称" @keydown.enter="onSaveGroup()"/>
            </div>
          </li>
          <li class="jg-aside-li">
            <div class="tyn-aside-title">群公告</div>
            <div class="tyn-media-row wr wr-unmute">
              <input type="text" class="tyn-title-overline text-none" v-model="state.xxx" placeholder="群公告" @keydown.enter="onSaveGroup()"/>
            </div>
          </li>
          <li class="jg-aside-li">
            <div class="tyn-aside-title">我在本群的昵称</div>
            <div class="tyn-media-row wr wr-user-st">
              <input type="text" class="tyn-title-overline text-none" v-model="state.groupNickname" placeholder="仅在本群可见" @keydown.enter="onSaveGroup()"/>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="tyn-aside-row tyn-rgaside-footer">
      <div class="nav-tabs jg-nav-tabs nav-tabs-line">
        <a class="btn w-100 jg-warn-letter" @click="">清空历史消息</a>
      </div>
      <div class="nav-tabs jg-nav-tabs nav-tabs-line" v-if="utils.isEqual(props.conversation.conversationType, ConversationType.GROUP)">
        <a class="btn w-100 jg-warn-letter" @click="">退出群聊</a>
      </div>
    </div>
    <ModalAddMemberGroup :is-show="state.isShowFriend" :is-loading="state.isCreateGroupLoading"
      :conversation="props.conversation" :members="state.members" @oncancel="onCancelGroupCreate"
      @onconfirm="onConfirmGroupCreate"></ModalAddMemberGroup>
    <ModalRemoveMemberGroup :is-show="state.currentGroupId" :group-id="state.currentGroupId"
      :is-loading="state.isGroupRemoveMemberLoading" :members="state.members" @oncancel="onCancelRemoveGroupMember"
      @onconfirm="onConfirmRemoveGroupMember"></ModalRemoveMemberGroup>
  </div>
</template>
