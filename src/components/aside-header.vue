<script setup>
const props = defineProps(['title']);
import { reactive, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import ModalFriendAdd from "../components/modal-friend-add.vue";
import AisdeSearch from './aside-search.vue';
import utils from "../common/utils";
import common from "../common/common";
import { STORAGE, RESPONSE, EVENT_NAME, GROUP_AVATAR } from "../common/enum";
import Storage from "../common/storage";
import { Friend } from "../services";
import emitter from "../common/emmit";
import im from "../common/im";
import HeaderDropMenu from '../components/header-menu.vue';
import ModalAddMemberGroup from "../components/modal-add-member-group.vue";
import { Group, User } from "../services/index";
import ModalUser from "../components/modal-user.vue";

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
  USER_SETTING: 6,
};

let state = reactive({
  isShowAddFriend: false,
  isDesktop: juggle.isDesktop(),
  isShowAddMenu: false,
  addMenus: [
    { name: '添加好友', icon: 'adduser', event: ASIDE_MENU_TYPE.ADD_FRIREND },
    { name: '创建群组', icon: 'group', event: ASIDE_MENU_TYPE.ADD_GROUP },
  ],
  isShowCreateGroup: false,
  isCreateGroupLoading: false,
  user: {},
  isShowUserClose: true,
  isShowUser: false,
});
const context = getCurrentInstance();

emitter.$on(EVENT_NAME.UN_UNATHORIZED, () => {
  Storage.remove(STORAGE.USER_TOKEN);
  let juggle = im.getCurrent();
  juggle.disconnect();
  router.replace({ name: 'Login' });
});

function onShowFriendAdd(isShow){
  state.isShowAddFriend = isShow;
}
function onShowAddMenu(isShow){
  state.isShowAddMenu = isShow;
}

function onFriendAddCancel(){
  onShowFriendAdd(false);
}
function onFriendAddConfirm(friend){
  let user = Storage.get(STORAGE.USER_TOKEN);
  Friend.add(friend).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: `添加好友失败：${code}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `已发送好友添加请求`,
      icon: 'success'
    });
    onShowFriendAdd(false);
    // let { ConversationType } = juggle;
    // let _friend = {
    //   id: friend.user.user_id,
    //   type: ConversationType.PRIVATE, 
    //   name: friend.user.nickname, 
    //   avatar: friend.user.avatar
    // }
    // emitter.$emit(EVENT_NAME.ON_ADDED_FRIEND, _friend);
  });
}

function onHideMenu(){
  onShowAddMenu(false);
}
function onNavChat(args){
  emit('onnav', args)
}
function onMenuClick(menu){
  let { event } = menu;
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_FRIREND)){
    onShowFriendAdd(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_GROUP)){
    onShowGroupCreate(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_SETTING)){
    onShowUserModal(true);
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
  let avatar = GROUP_AVATAR;
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
}

function onShowUserModal(isShow){
  utils.extend(state, { isShowUser: isShow });
}
function onUserCanncel(){
  onShowUserModal(false);
}
let isSaveingUser = false;
function onUserSave(user){
  if(isSaveingUser){
    return;
  }
  isSaveingUser = true;
  User.update(user).then((result) => {
    isSaveingUser = false;
    if(!utils.isEqual(result.code, RESPONSE.SUCCESS)){
      let errorCode = result.code;
      return context.proxy.$toast({
        text: `保存失败：${errorCode}`,
        icon: 'error'
      });
    }
    utils.extend(state.user, user);
    utils.extend(state, { isShowUser: false, isShowUserClose: true });

    let _user = Storage.get(STORAGE.USER_TOKEN);
    _user = utils.extend(_user, user);
    Storage.set(STORAGE.USER_TOKEN, _user);
    emitter.$emit(EVENT_NAME.ON_USER_INFO_UPDATE, { user: _user });
  });
}


// 强制修改头像
let user = Storage.get(STORAGE.USER_TOKEN);
let portrait = user.portrait || '';
let isShowUser = utils.isBase64(portrait.replace('data:image/jpeg;base64,', ''));
utils.extend(state, { user, isShowUser, isShowUserClose: !isShowUser });

emitter.$on(EVENT_NAME.ON_USER_INFO_UPDATE, ({ user }) => {
  utils.extend(state.user, user);
});
</script>

<template>
  <div class="tyn-aside-head" :class="{ 'tyn-aside-desktop': state.isDesktop }">
    <div class="tyn-aside-head-tools">
      <ul class="tyn-list-inline jg-asider-tools">
        
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

    <ModalUser :is-show="state.isShowUser" :is-show-close="state.isShowUserClose" :user="state.user" @oncancel="onUserCanncel" @onconfirm="onUserSave"></ModalUser>
  </div>
</template>
