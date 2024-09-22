<script setup>
const props = defineProps(['title']);
import { reactive, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import ModalFriendAdd from "../components/modal-friend-add.vue";
import AisdeSearch from './aside-search.vue';
import utils from "../common/utils";
import common from "../common/common";
import { STORAGE, RESPONSE, EVENT_NAME } from "../common/enum";
import Storage from "../common/storage";
import { Friend } from "../services";
import emitter from "../common/emmit";
import im from "../common/im";
import HeaderDropMenu from '../components/header-menu.vue';
import ModalAddMemberGroup from "../components/modal-add-member-group.vue";
import { Group } from "../services/index";

const emit = defineEmits(["onnav"]);
const router = useRouter();

let juggle = im.getCurrent();
let { ConversationType } = juggle;

let ASIDE_MENU_TYPE = {
  ADD_FRIREND: 1,
  ADD_GROUP: 2,
  MESSAGE: 3,
  CONTACT: 4,
  LOGOUT: 5,
};

let state = reactive({
  isShowAddFriend: false,
  isDesktop: juggle.isDesktop(),
  isShowAddMenu: false,
  isShowSettingMenu: false,
  settingMenus: [
    { name: '会话', icon: 'message', event: ASIDE_MENU_TYPE.MESSAGE },
    { name: '联系人', icon: 'contact', event: ASIDE_MENU_TYPE.CONTACT },
    { type: 'line', icon: 'contact', event: ASIDE_MENU_TYPE.CONTACT },
    { name: '退出', icon: 'logout', event: ASIDE_MENU_TYPE.LOGOUT },
  ],
  addMenus: [
    { name: '添加好友', icon: 'adduser', event: ASIDE_MENU_TYPE.ADD_FRIREND },
    { name: '创建群组', icon: 'group', event: ASIDE_MENU_TYPE.ADD_GROUP },
  ],
  isShowCreateGroup: false,
  isCreateGroupLoading: false,
});
const context = getCurrentInstance();

function onShowFriendAdd(isShow){
  state.isShowAddFriend = isShow;
}
function onShowAddMenu(isShow){
  state.isShowAddMenu = isShow;
  state.isShowSettingMenu = false;
}
function onShowSettingMenu(isShow){
  state.isShowSettingMenu = isShow;
  state.isShowAddMenu = false;
}
function onFriendAddCancel(){
  onShowFriendAdd(false);
  onShowSettingMenu(false)
}
function onFriendAddConfirm(friend){
  let user = Storage.get(STORAGE.USER_TOKEN);
  utils.extend(friend, { userId: user.id });
  Friend.add(friend).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: `添加好友失败：${code}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `添加好友成功`,
      icon: 'success'
    });
    onShowFriendAdd(false);
    let { ConversationType } = juggle;
    let _friend = {
      id: friend.user.user_id,
      type: ConversationType.PRIVATE, 
      name: friend.user.nickname, 
      avatar: friend.user.avatar
    }
    emitter.$emit(EVENT_NAME.ON_ADDED_FRIEND, _friend);
  });
}

function onHideMenu(){
  onShowAddMenu(false);
  onShowSettingMenu(false);
}
function onNavChat(args){
  emit('onnav', args)
}
function onMenuClick(menu){
  let { event } = menu;
  if(utils.isEqual(event, ASIDE_MENU_TYPE.MESSAGE)){
    router.push({ name: 'ConversationList' });
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.CONTACT)){
    router.push({ name: 'Contacts' });
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.LOGOUT)){
    Storage.remove(STORAGE.USER_TOKEN);
    let juggle = im.getCurrent();
    juggle.disconnect();
    router.push({ name: 'Login' });
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_FRIREND)){
    onShowFriendAdd(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_GROUP)){
    onShowGroupCreate(true);
  }
  onHideMenu();
}
function onShowGroupCreate(isShow){
  state.isShowCreateGroup = isShow;
}
function onCancelGroupCreate(e){
  onShowGroupCreate(false);
}
function onConfirmGroupCreate({ friends }){
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
    return !friend.disabled;
  });
  common.createGroupAvatar(friends, (avatar) => {
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
      onCancelGroupCreate();
      state.isCreateGroupLoading = false;
    });
  });
}
</script>

<template>
  <div class="tyn-aside-head" :class="{ 'tyn-aside-desktop': state.isDesktop }">
    <div class="tyn-aside-head-tools">
      <ul class="tyn-list-inline jg-asider-tools">
        <li class="jg-asider-tool">
          <button class="btn btn-icon btn-light btn-md wr wr-more-list" @click="onShowSettingMenu(true)"></button>
          <HeaderDropMenu @onemit="onMenuClick" :is-show="state.isShowSettingMenu" :menus="state.settingMenus"  @onhide="onShowSettingMenu(false)"></HeaderDropMenu>
        </li>
        <li v-if="state.isDesktop" class="jg-asider-tool jg-asider-tool-search">
          <AisdeSearch @onnav="onNavChat"></AisdeSearch>
        </li>
        <li class="jg-asider-tool">
          <button class="btn btn-icon btn-light btn-md wr wr-plus" @click="onShowAddMenu(true)"></button>
          <HeaderDropMenu @onemit="onMenuClick" :is-show="state.isShowAddMenu" :menus="state.addMenus" :class="'tyn-header-create-list'" @onhide="onShowAddMenu(false)"></HeaderDropMenu>
        </li>
      </ul>
    </div>
    <ModalFriendAdd :is-show="state.isShowAddFriend" @oncancel="onFriendAddCancel" @onconfirm="onFriendAddConfirm"></ModalFriendAdd>
    
    <ModalAddMemberGroup 
      :is-show="state.isShowCreateGroup" 
      :is-loading="state.isCreateGroupLoading"
      :conversation="{}"
      :members="[]"
      @oncancel="onCancelGroupCreate"
      @onconfirm="onConfirmGroupCreate"></ModalAddMemberGroup>

  </div>
</template>
