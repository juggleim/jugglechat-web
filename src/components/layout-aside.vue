<script setup>
const props = defineProps(['title']);
import { reactive, getCurrentInstance, watch } from "vue";
import { useRouter } from "vue-router";
import utils from "../common/utils";
import common from "../common/common";
import { STORAGE, RESPONSE, EVENT_NAME, SYS_CONVERSATION_FRIEND, IGNORE_CONVERSATIONS, GROUP_AVATAR } from "../common/enum";
import Storage from "../common/storage";
import { Friend } from "../services";
import emitter from "../common/emmit";
import im from "../common/im";
import HeaderDropMenu from './header-menu.vue';
import { Group, User } from "../services/index";
import ModalUser from "./modal-user.vue";
import ModalAddMemberGroup from "./modal-add-member-group.vue";
import ModalFriendAdd from "./modal-friend-add.vue";
import ModalUserSetting from "./modal-user-setting.vue";
import ModalSearch from "./modal-search.vue";
import ModalUserAccount from "./modal-user-account.vue";

const emit = defineEmits([]);
const router = useRouter();
const context = getCurrentInstance();

let juggle = im.getCurrent();
let { ConversationType, Event, ConnectionState } = juggle;

let ASIDE_MENU_TYPE = {
  ADD_FRIREND: 1,
  ADD_GROUP: 2,
  MESSAGE: 3,
  CONTACT: 4,
  USER_SETTING: 6,
  USER_UPDATE: 7,
  USER_LOGOUT: 8,
  USER_ACCOUNT: 9
};

let { _value: { path } } = router.currentRoute;

let state = reactive({
  settingMenus: [
    { id: `${Date.now()}`, title: '消息', type: 'top', icon: 'message', event: ASIDE_MENU_TYPE.MESSAGE, name: 'ConversationList', isActive: utils.isEqual(path, '/conversation') },
    { id: `${SYS_CONVERSATION_FRIEND}`, type: 'top', title: '通讯录', icon: 'contact', event: ASIDE_MENU_TYPE.CONTACT, name: 'Contacts', isActive: utils.isEqual(path, '/contacts'), unreadCount: 0 },
  ],
  addMenus: [
    { name: '添加好友', icon: 'adduser', event: ASIDE_MENU_TYPE.ADD_FRIREND },
    { name: '创建群组', icon: 'group', event: ASIDE_MENU_TYPE.ADD_GROUP },
  ],
  userMenus: [
    { name: '用户设置', icon: 'config', event: ASIDE_MENU_TYPE.USER_SETTING },
    { name: '信息修改', icon: 'operate', event: ASIDE_MENU_TYPE.USER_UPDATE },
    { name: '添加账号', icon: 'adduser', event: ASIDE_MENU_TYPE.USER_ACCOUNT },
    { name: '退出登录', icon: 'logout', isWarn: true, event: ASIDE_MENU_TYPE.USER_LOGOUT },
  ],
  bottomMenus: [],
  isShowSearchModal: false,
  isShowAddMenu: false,
  isShowSettingMenu: false,
  isShowAddFriend: false,
  isShowCreateGroup: false,
  isCreateGroupLoading: false,
  isShowUserClose: true,
  isShowUser: false,
  isShowUserSetting: false,
  isShowAddAccount: false,
});

function onShowAddMenu(isShow){
  state.isShowAddMenu = isShow;
}

function onShowSearchModal(isShow){
  state.isShowSearchModal = isShow;
}

function onShowSettingMenu(isShow){
  state.isShowSettingMenu = isShow;
}

function onShowAccountModal(isShow){
  state.isShowAddAccount = isShow;
}

function onConversationChanged({ conversations }){
  utils.forEach(conversations, (conversation) => {
    let { conversationId } = conversation;
    if(!utils.isInclude(IGNORE_CONVERSATIONS, conversationId)){
      return;
    }
    utils.forEach(state.settingMenus, (menu) => {
      if(utils.isInclude(menu.id, conversationId)){
        menu.unreadCount = conversation.unreadCount; 
      }
    });
  });
}
juggle.on(Event.CONVERSATION_CHANGED, onConversationChanged);
juggle.on(Event.CONVERSATION_ADDED, onConversationChanged);

let user = Storage.get(STORAGE.USER_TOKEN);
utils.extend(state, { user });

emitter.$on(EVENT_NAME.UN_UNATHORIZED, () => {
  Storage.remove(STORAGE.USER_TOKEN);
  let juggle = im.getCurrent();
  juggle.disconnect();
  router.replace({ name: 'Login' });
});

juggle.on(Event.STATE_CHANGED, ({ state: status }) => {
  if (ConnectionState.CONNECTED == status) {
    juggle.getConversation({ conversationId: SYS_CONVERSATION_FRIEND, conversationType: ConversationType.SYSTEM }).then(({ conversation }) => {
      let index = utils.find(state.settingMenus, (menu) => { 
        return utils.isEqual(menu.event, ASIDE_MENU_TYPE.CONTACT)
      });
      let menu = state.settingMenus[index];
      menu.unreadCount = conversation.unreadCount;
    });
  }
});

function selectMenu(menu){
  let { settingMenus, bottomMenus } = state;
  let { type } = menu;
  let menus = utils.isEqual(type, 'bottom') ? bottomMenus : settingMenus;
  let otherMenus = utils.isEqual(type, 'bottom') ? settingMenus : bottomMenus;
  utils.forEach(otherMenus, (item) => {
    item.isActive = false;
  });
  utils.forEach(menus, (item) => {
    item.isActive = utils.isEqual(item.id, menu.id);
  });
}
function onMenuClick(menu){
  let { event } = menu;
  selectMenu(menu);
  router.push({ name: menu.name });
}

emitter.$on(EVENT_NAME.ON_USER_INFO_UPDATE, ({ user }) => {
  utils.extend(state.user, user);
});

function onHideMenu(){
  onShowAddMenu(false);
  onShowSettingMenu(false);
}
function onDropMenuClick(menu){
  let { event } = menu;
  onHideMenu();
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_FRIREND)){
    onShowFriendAdd(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_GROUP)){
    onShowGroupCreate(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_UPDATE)){
    onShowUserModal(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_SETTING)){
    onShowUserSettingModal(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_ACCOUNT)){
    onShowAccountModal(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_LOGOUT)){
    emitter.$emit(EVENT_NAME.UN_UNATHORIZED);
  }
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

function onShowUserSettingModal(isShow){
  utils.extend(state, { isShowUserSetting: isShow });
};
function onUserSettingCancel(){
  onShowUserSettingModal(false);
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
function onShowFriendAdd(isShow){
  state.isShowAddFriend = isShow;
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

function onNavChat(item) {
  onShowSearchModal(false);
  juggle.getConversation(item).then(({ conversation }) => {
    emitter.$emit(EVENT_NAME.ON_CONVERSATION_SEARCH_NAV, { conversation });
  });
}

// 强制修改头像
let portrait = user.portrait || '';
let isShowUser = utils.isBase64(portrait.replace('data:image/jpeg;base64,', ''));
utils.extend(state, { user, isShowUser, isShowUserClose: !isShowUser });

let useRouterCurrent = reactive(router);
watch(useRouterCurrent, (value) => {
  let { currentRoute: { name } } = value;
  let list = state.bottomMenus.concat(state.settingMenus);
  let index = utils.find(list, (item) => {
    return utils.isEqual(item.name, name);
  });
  let menu = list[index];
  selectMenu(menu)
});
</script>

<template>
  <div class="tyn-aside-footer" :class="{ 'tyn-aside-desktop': juggle.isDesktop() }">
    <ul class="jg-footer-tools jg-footer-top-box">
      <li class="jg-footer-tool"  @click.prevent="onShowSettingMenu(true)">
        <div class="jg-header-user">
          <div class="tyn-avatar jg-header-user-avatar" :style="{ 'background-image': 'url(' + state.user.portrait + ')' }"></div>
          <div class="jg-header-user-name">{{ state.user.name || state.user.id }}</div>
        </div>
        <HeaderDropMenu @onemit="onDropMenuClick" :is-show="state.isShowSettingMenu" :menus="state.userMenus" :class="'tyn-header-create-list jg-layout-settingdrop'" @onhide="onShowSettingMenu(false)"></HeaderDropMenu>
      </li>
      
      <li class="jg-footer-tool" v-if="juggle.isDesktop()">
        <div class="jg-asider-footer-item" @click="onShowSearchModal(true)">
          <div class="icon wr wr-search"></div>
          <div class="name">搜索</div>
        </div>
      </li>

      <li class="jg-footer-tool">
        <div class="jg-asider-footer-item" @click="onShowAddMenu(true)">
          <div class="icon wr wr-plus"></div>
          <div class="name">创建</div>
        </div>
        <HeaderDropMenu @onemit="onDropMenuClick" :is-show="state.isShowAddMenu" :menus="state.addMenus" :class="'tyn-header-create-list'" @onhide="onShowAddMenu(false)"></HeaderDropMenu>
      </li>

      <li class="jg-footer-tool" v-for="menu in state.settingMenus">
        <div class="jg-asider-footer-item" @click="onMenuClick(menu)" :class="[menu.isActive ? 'jg-footer-active' : '']">
          <div class="nav-unreadcount" v-if="menu.unreadCount > 0">{{ menu.unreadCount }}</div>
          <div class="icon wr" :class="{ ['wr-' + menu.icon]: true }"></div>
          <div class="name">{{ menu.title }}</div>
        </div>
      </li>
    </ul>
    <!-- <ul class="jg-footer-tools jg-footer-bottom-box">
      <li class="jg-footer-tool">
        <div class="jg-asider-footer-item" @click="onShowSettingMenu(true)">
          <div class="icon wr wr-setting"></div>
          <div class="name">设置</div>
        </div>
        <HeaderDropMenu @onemit="onDropMenuClick" :is-show="state.isShowSettingMenu" :menus="state.bottomMenus" :class="'tyn-header-create-list jg-layout-settingdrop'" @onhide="onShowSettingMenu(false)"></HeaderDropMenu>
      </li>
    </ul> -->
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
  <ModalUserSetting :is-show="state.isShowUserSetting" @oncancel="onUserSettingCancel" ></ModalUserSetting>
  <ModalSearch :is-show="state.isShowSearchModal" @oncancel="onShowSearchModal(false)" @onnav="onNavChat"></ModalSearch>
  <ModalUserAccount :is-show="state.isShowAddAccount" @oncancel="onShowAccountModal(false)"></ModalUserAccount>
</template>
