<script setup>
const props = defineProps(['title']);
import { reactive, getCurrentInstance, watch } from "vue";
import { useRouter } from "vue-router";
import utils from "../common/utils";
import common from "../common/common";
import { ASIDE_MENU_TYPE, STORAGE, RESPONSE, EVENT_NAME, SYS_CONVERSATION_FRIEND, IGNORE_CONVERSATIONS, GROUP_AVATAR } from "../common/enum";
import Storage from "../common/storage";
import { Friend } from "../services";
import emitter from "../common/emmit";
import im from "../common/im";
import HeaderDropMenu from './header-menu.vue';
import { Group, User } from "../services/index";

import AsiderFriendAdd from "./aside-friend-add.vue";
import AsiderGroupAddMember from "./aside-group-add-member.vue";
import AsiderUserSetting from "./aside-user-setting.vue";
import AsideUserUpdate from "./aside-user-update.vue";

const emit = defineEmits([]);
const router = useRouter();
const context = getCurrentInstance();

let juggle = im.getCurrent();
let { ConversationType, Event, ConnectionState } = juggle;

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
    { name: '账号管理', icon: 'adduser', event: ASIDE_MENU_TYPE.USER_ACCOUNT },
    { name: '退出登录', icon: 'logout', isWarn: true, event: ASIDE_MENU_TYPE.USER_LOGOUT },
  ],
  bottomMenus: [],
  isShowSearchModal: false,
  isShowAddMenu: false,
  isShowSettingMenu: false,
  isShowAddFriend: false,
  isShowCreateGroup: false,
  isCreateGroupLoading: false,
  disableClose: false,
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
}

function onShowGroupCreate(isShow){
  state.isShowCreateGroup = isShow;
}
function onCancelGroupCreate(e){
  onShowGroupCreate(false);
}

function onShowUserModal(isShow){
  utils.extend(state, { isShowUser: isShow });
}
function onUserCanncel(){
  onShowUserModal(false);
}

function onShowFriendAdd(isShow){
  state.isShowAddFriend = isShow;
}
function onFriendAddCancel(){
  onShowFriendAdd(false);
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
utils.extend(state, { user, isShowUser, disableClose: isShowUser });

let useRouterCurrent = reactive(router);
watch(useRouterCurrent, (value) => {
  let { currentRoute: { name } } = value;
  let list = state.bottomMenus.concat(state.settingMenus);
  let index = utils.find(list, (item) => {
    return utils.isEqual(item.name, name);
  });
  let menu = list[index];
  if(!utils.isMobile()){
    selectMenu(menu);
  }
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

  <AsiderFriendAdd :is-show="state.isShowAddFriend" @oncancel="onFriendAddCancel"></AsiderFriendAdd>
  <AsiderGroupAddMember
    :is-show="state.isShowCreateGroup" 
    :conversation="{}"
    :members="[]"
    @oncancel="onCancelGroupCreate"
  ></AsiderGroupAddMember>
  <AsiderUserSetting :is-show="state.isShowSettingMenu" @oncancel="onShowSettingMenu(false)"></AsiderUserSetting>

  <AsideUserUpdate :is-show="state.isShowUser" :disabled-close="state.disableClose" @oncancel="onUserCanncel"></AsideUserUpdate>
</template>
