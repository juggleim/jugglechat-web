<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../../common/utils";
import im from "../../common/im";
import ModalAddMemberGroup from "../../components/modal-add-member-group.vue";
import ModalRemoveMemberGroup from "../../components/modal-remove-member-group.vue";
import ModalTranserGroupOwner from "../../components/modal-transfer-group-owner.vue";
import ModalTranslator from "../../components/modal-translator.vue";
import ModalGroupNotice from "../../components/modal-group-notice.vue";
import JSwitch from "../../components/switch.vue";
import Asider from "../../components/aside.vue";
import AsiderGroupAddMember from "../../components/aside-group-add-member.vue";
import AsiderGroupRemoveMember from "../../components/aside-group-remove-member.vue";

import { Group } from "../../services/index";
import messageUtils from "../../components/message-utils";
import Storage from "../../common/storage";
import common from "../../common/common";
import { GROUP_ROLE, ASIDER_SETTING_SWITCH, STORAGE, GROUP_CHANGE_TYPE, MSG_NAME, EVENT_NAME, RESPONSE, GROUP_AVATAR } from "../../common/enum";
import emitter from "../../common/emmit";

const props = defineProps(["isShow", "conversation", "members", "group"]);
const emit = defineEmits(["onclearmsg", "onquitgroup", "ontop", "ondisturb", "onbangroup", "oncancel"]);

const context = getCurrentInstance();
let juggle = im.getCurrent();
let { MessageType, ConversationType, UndisturbType } = juggle;

let state = reactive({
  members: [],
  isShowFriend: false,
  isShowGroupNotice: false,
  isShowTransferGroupOwner: false,
  isShowTranslator: false,
  isCreateGroupLoading: false,
  isGroupRemoveMemberLoading: false,
  currentGroupId: '',
  group: {},
  groupName: props.conversation.conversationTitle,
  groupDisplayName: '',
  groupNoticeContent: '',

  switches: [
    { uid: ASIDER_SETTING_SWITCH.TOP, title: '会话置顶', isOpen: false, isShow: true },
    { uid: ASIDER_SETTING_SWITCH.MUTE, title: '消息免打扰', isOpen: false, isShow: true },
    { uid: ASIDER_SETTING_SWITCH.BAN, title: '群组全局禁言', isOpen: props.group, isShow: false },
    { uid: ASIDER_SETTING_SWITCH.HISTORY, title: '新人入群查看历史', isOpen: props.group, isShow: false },
  ]
});

function onShowFriendAdd(isShow) {
  state.isShowFriend = isShow;
}
function onShowGroupNotice(isShow){
  state.isShowGroupNotice = isShow;
}
function onShowMemberRemove(groupId) {
  state.currentGroupId = groupId;
}
function onCancelGroupCreate(result) {
  onShowFriendAdd(false);
  result = result || { members: []}
  let { members } = result;
  utils.forEach(members, (member) => {
    let { avatar, nickname, user_id } = member;
    state.members.push({ id: user_id, portrait: avatar, name: nickname  });
  });
}
function onCancelRemoveGroupMember() {
  onShowMemberRemove('');
}

function onConfirmRemoveGroupMember({ members }) {
  utils.forEach(members, (rMember) => {
    utils.forEach(state.members, (member, index) => {
      if (member && utils.isEqual(rMember.id, member.id)) {
        state.members.splice(index, 1);
      }
    })
  });
  onCancelRemoveGroupMember();
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
  let { conversationId, conversationTitle, conversationType } = props.conversation;
  let isGroup = utils.isEqual(conversationType, ConversationType.GROUP);
  if (isGroup) {
    // 如果修改过自定义名字不再拼接名称，通过逗号判断比较简单粗暴，准确做法需要服务端支持
    let isUpdateName = utils.isInclude(conversationTitle, ',') && state.members.length < 9
    return Group.addMember({ id: conversationId, members }).then(() => {
      let conversation = { conversationId, conversationPortrait: GROUP_AVATAR, conversationTitle };
      emitter.$emit(EVENT_NAME.ON_GROUP_MEMBER_ADDED, { conversation, members })
      next();
    });
  }

  Group.create({ name, avatar: GROUP_AVATAR, members }).then((result) => {
    let { data: group } = result;
    let conversation = {
      conversationType: ConversationType.GROUP,
      conversationId: group.group_id,
      conversationTitle: name,
      conversationPortrait: GROUP_AVATAR,
      latestMessage: {}
    };
    emitter.$emit(EVENT_NAME.ON_GROUP_CREATED, { conversation })
    next(group);
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

function onSaveGroupDisplayName(){
  let { conversationId } = props.conversation;
  let { groupDisplayName  } = state;
  let params = {
    group_id: conversationId,
    grp_display_name: groupDisplayName
  };
  Group.setDisplayName(params).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: `修改失败：${code}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `保存成功`,
      icon: 'success'
    });
  });
}
function onUpdateNotice({ content }){
  let { conversationId } = props.conversation;
  state.groupNoticeContent = content;
  let params = {
    group_id: conversationId,
    content: content
  };
  Group.setNotice(params).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: `发布公告失败：${code}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `发布公告成功`,
      icon: 'success'
    });
  });
  onShowGroupNotice(false);
}

function onQuitGroup(){
  let { conversationId } = props.conversation;
  Group.quit({ group_id: conversationId }).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: `退群失败：${code}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `退群成功`,
      icon: 'success'
    });
    emit('onquitgroup', props.conversation)
  });
}
function onClearMessages(){
  context.proxy.$showModal({
    title: '提醒',
    icon: 'error',
    content: '是否清空历史消息?',
    onCancel: () => { },
    onConfirm: () => {
      emit('onclearmsg', {});
    }
  });
}
function onSwitchChanged({ uid, isOpen }){
  if(utils.isEqual(uid, ASIDER_SETTING_SWITCH.TOP)){
    emit('ontop', isOpen);
  }
  if(utils.isEqual(uid, ASIDER_SETTING_SWITCH.MUTE)){
    emit('ondisturb', isOpen);
  }
  if(utils.isEqual(uid, ASIDER_SETTING_SWITCH.HISTORY)){
    let num = Number(isOpen)
    updateSwitchValue(uid, isOpen, { isShow: true });
    openGroupHistory({ num })
  }
  if(utils.isEqual(uid, ASIDER_SETTING_SWITCH.BAN)){
    updateSwitchValue(uid, isOpen, { isShow: true });
    setGroupBan({ isOpen });
  }
}

function setGroupBan({ isOpen }){
  Group.setMute({ id: props.group.id, isMute: isOpen }).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      updateSwitchValue(ASIDER_SETTING_SWITCH.BAN, !isOpen, { isShow: true });
      return context.proxy.$toast({
        text: `禁言失败：${code}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `禁言成功`,
      icon: 'success'
    });
    emit('onbangroup', isOpen);
  });
}

function openGroupHistory({ num }){
  Group.setGroupHisVerify({ group_id: props.group.id, num }).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      updateSwitchValue(ASIDER_SETTING_SWITCH.HISTORY, !num, { isShow: true });
      return context.proxy.$toast({
        text: `设置失败：${code}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `设置成功`,
      icon: 'success'
    });
  });
}
function updateSwitchValue(name, value, option){
  option = option || {};
  let index = utils.find(state.switches, (item) => {
    return utils.isEqual(item.uid, name);
  });
  if(index > -1){
    let { isShow } = option;
    utils.extend(state.switches[index], { isOpen: value, isShow });
  }
}

function onCancel(){
  emit('oncancel', {});
}

function onShowTransferGroupOwner(isShow){
  state.isShowTransferGroupOwner = isShow;
}
function onFinishTransferGroupOwner(){
  state.group.my_role = GROUP_ROLE.MEMBER;
  updateSwitchValue(ASIDER_SETTING_SWITCH.BAN, false, { isShow: false });
  updateSwitchValue(ASIDER_SETTING_SWITCH.HISTORY, false, { isShow: false });
  onShowTransferGroupOwner(false);
}

function onFinishTranslator(){
  onShowTranslator(false); 
}
function onShowTranslator(isShow){
  state.isShowTranslator = isShow;
}
watch(() => props.conversation, (conversation) => {
  state.groupName = conversation.conversationTitle;
});

watch(() => props.isShow, () => {
  let { conversationType, conversationId } = props.conversation;
  let isGroup = utils.isEqual(conversationType, ConversationType.GROUP);

  updateSwitchValue(ASIDER_SETTING_SWITCH.MUTE, utils.isEqual(props.conversation.undisturbType, UndisturbType.DISTURB), { isShow: true });
  updateSwitchValue(ASIDER_SETTING_SWITCH.TOP, props.conversation.isTop, { isShow: true });

  if(props.isShow && isGroup){
    let { group_management: { group_his_msg_visible, group_mute } } = props.group;
    utils.extend(state, { members: props.members, group: props.group, groupDisplayName: props.group.grp_display_name || '' });
    let role = props.group.my_role || 0;
    let isShow = role > GROUP_ROLE.MEMBER;
    
    updateSwitchValue(ASIDER_SETTING_SWITCH.HISTORY, !!group_his_msg_visible, { isShow });
    updateSwitchValue(ASIDER_SETTING_SWITCH.BAN, !!group_mute, { isShow });

    Group.getNotice({ group_id: conversationId }).then(result => {
      let { code, data } = result;
      if(utils.isEqual(code, RESPONSE.SUCCESS)){
        let { content } = data;
        state.groupNoticeContent = content;
      }
    });
  }else{
    updateSwitchValue(ASIDER_SETTING_SWITCH.HISTORY, false, { isShow: false });
    updateSwitchValue(ASIDER_SETTING_SWITCH.BAN, false, { isShow: false });
  }
});
</script>

<template>
  <Asider :is-show="props.isShow" :title="'会话详情'" @oncancel="onCancel" :right="1">
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
    <div class="tyn-aside-row py-0 tyn-rgaside-body">
      <div class="nav-tabs jg-nav-tabs nav-tabs-line">
        <ul class="jg-aside-ul" v-if="utils.isEqual(props.conversation.conversationType, ConversationType.GROUP)">
          <li class="jg-aside-li">
            <div class="tyn-aside-title">群聊名称</div>
            <div class="tyn-media-row jg-df-row">
              <input type="text" class="tyn-title-overline text-none" v-model="state.groupName" placeholder="输入群聊名称" @keydown.enter="onSaveGroup()"/>
              <div class="wr jg-df-modify-icon"></div>
            </div>
          </li>
          <li class="jg-aside-li">
            <div class="tyn-aside-title">群公告</div>
            <div class="tyn-media-row" @click="onShowGroupNotice(true)">
              <div class="tyn-title-overline text-none jg-group-notice-line">{{ state.groupNoticeContent || '未设置群公告' }}</div>
            </div>
          </li>
          <li class="jg-aside-li">
            <div class="tyn-aside-title">我在本群的昵称</div>
            <div class="tyn-media-row jg-df-row">
              <input type="text" class="tyn-title-overline text-none" v-model="state.groupDisplayName" placeholder="仅在本群可见" @keydown.enter="onSaveGroupDisplayName()"/>
              <div class="wr jg-df-modify-icon"></div>
            </div>
          </li>
          <li class="jg-aside-li jg-aside-bli" v-if="state.group.my_role == GROUP_ROLE.OWNER" @click="onShowTransferGroupOwner(true)">
            <div class="tyn-aside-title">转让群主</div>
            <span class="tyn-aside-icon wr wr-right"></span>
          </li>
          <li class="jg-bottom-line"></li>
        </ul>
        <ul class="jg-aside-ul">
          <li class="jg-aside-li jg-aside-bli" @click="onShowTranslator(true)">
            <div class="tyn-aside-title">接收消息自动翻译</div>
            <span class="tyn-aside-icon wr wr-right"></span>
          </li>
          <li class="jg-bottom-line"></li>
        </ul>
        <ul class="jg-aside-ul">
          <li class="jg-aside-li jg-aside-btn-li" v-for="item in state.switches">
            <div class="tyn-aside-title" v-if="item.isShow">{{ item.title }}</div>
            <div class="tyn-aside-button" v-if="item.isShow">
              <JSwitch :uid="item.uid" :is-checked="item.isOpen" @onchanged="onSwitchChanged" ></JSwitch>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="tyn-aside-row tyn-rgaside-footer">
      <div class="nav-tabs jg-nav-tabs nav-tabs-line">
        <a class="btn w-100 jg-warn-letter" @click="onClearMessages">清空历史消息</a>
      </div>
      <div class="nav-tabs jg-nav-tabs nav-tabs-line" v-if="utils.isEqual(props.conversation.conversationType, ConversationType.GROUP)">
        <a class="btn w-100 jg-warn-letter" @click="onQuitGroup()">退出群聊</a>
      </div>
    </div>
  </Asider>

  <AsiderGroupAddMember 
    :is-show="state.isShowFriend" 
    :right="1" 
    :title="'添加成员'"
    :conversation="props.conversation" 
    :members="state.members" 
    @oncancel="onCancelGroupCreate">
  </AsiderGroupAddMember>

  <AsiderGroupRemoveMember
    :is-show="state.currentGroupId" 
    :group-id="state.currentGroupId"
    :members="state.members" 
    :right="1"
    @oncancel="onCancelRemoveGroupMember"
    @onconfirm="onConfirmRemoveGroupMember"
  ></AsiderGroupRemoveMember>
  <!-- <ModalAddMemberGroup :is-show="state.isShowFriend" :is-loading="state.isCreateGroupLoading"
    :conversation="props.conversation" :members="state.members" @oncancel="onCancelGroupCreate"
    @onconfirm="onConfirmGroupCreate"></ModalAddMemberGroup> -->
  
  <!-- <ModalRemoveMemberGroup :is-show="state.currentGroupId" :group-id="state.currentGroupId"
    :is-loading="state.isGroupRemoveMemberLoading" :members="state.members" @oncancel="onCancelRemoveGroupMember"
    @onconfirm="onConfirmRemoveGroupMember"></ModalRemoveMemberGroup> -->

  <ModalTranserGroupOwner :is-show="state.isShowTransferGroupOwner" :group-id="props.conversation.conversationId" 
    :members="state.members" 
    @onfinish="onFinishTransferGroupOwner"
    @oncancel="onShowTransferGroupOwner(false)"></ModalTranserGroupOwner>

  <ModalTranslator :is-show="state.isShowTranslator" 
    :conversation="props.conversation" 
    @onfinish="onFinishTranslator"
    @oncancel="onShowTranslator(false)"></ModalTranslator>
  <ModalGroupNotice :is-show="state.isShowGroupNotice" :content="state.groupNoticeContent" @onconfirm="onUpdateNotice" @oncancel="onShowGroupNotice(false)"></ModalGroupNotice>
</template>
