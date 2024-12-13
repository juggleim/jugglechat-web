<script setup>
const props = defineProps(['title']);
import { reactive, getCurrentInstance, watch } from "vue";
import { useRouter } from "vue-router";
import ModalFriendAdd from "./modal-friend-add.vue";
import AisdeSearch from './aside-search.vue';
import utils from "../common/utils";
import common from "../common/common";
import { STORAGE, RESPONSE, EVENT_NAME, SYS_CONVERSATION_FRIEND, IGNORE_CONVERSATIONS } from "../common/enum";
import Storage from "../common/storage";
import { Friend } from "../services";
import emitter from "../common/emmit";
import im from "../common/im";
import HeaderDropMenu from './header-menu.vue';
import { Group, User } from "../services/index";
import ModalUser from "./modal-user.vue";

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
  LOGOUT: 5,
  USER_SETTING: 6,
};

let { _value: { path } } = router.currentRoute;

let state = reactive({
  settingMenus: [
    { id: `${Date.now()}`, title: '消息', type: 'top', icon: 'message', event: ASIDE_MENU_TYPE.MESSAGE, name: 'ConversationList', isActive: utils.isEqual(path, '/conversation') },
    { id: `${SYS_CONVERSATION_FRIEND}`, type: 'top', title: '通讯录', icon: 'contact', event: ASIDE_MENU_TYPE.CONTACT, name: 'Contacts', isActive: utils.isEqual(path, '/contacts'), unreadCount: 0 },
  ],
  bottomMenus: [
  { id: `${Date.now()}`, title: '设置', type: 'bottom', icon: 'setting', event: ASIDE_MENU_TYPE.USER_SETTING, name: 'Settings', isActive: utils.isEqual(path, '/setting') },
  ]
});

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
  <div class="tyn-aside-footer" :class="{ 'tyn-aside-desktop': state.isDesktop }">
    <ul class="jg-footer-tools jg-footer-top-box">
      <li class="jg-footer-tool">
        <div class="jg-header-user">
          <div class="tyn-avatar jg-header-user-avatar" :style="{ 'background-image': 'url(' + state.user.portrait + ')' }"></div>
          <div class="jg-header-user-name">{{ state.user.name || state.user.id }}</div>
        </div>
      </li>
      <li class="jg-footer-tool" v-for="menu in state.settingMenus">
        <div class="jg-asider-footer-item" @click="onMenuClick(menu)" :class="[menu.isActive ? 'jg-footer-active' : '']">
          <div class="nav-unreadcount" v-if="menu.unreadCount > 0">{{ menu.unreadCount }}</div>
          <div class="icon wr" :class="{ ['wr-' + menu.icon]: true }"></div>
          <div class="name">{{ menu.title }}</div>
        </div>
      </li>
    </ul>
    <ul class="jg-footer-tools jg-footer-bottom-box">
      <li class="jg-footer-tool" v-for="menu in state.bottomMenus">
        <div class="jg-asider-footer-item" @click="onMenuClick(menu)" :class="[menu.isActive ? 'jg-footer-active' : '']">
          <div class="icon wr" :class="{ ['wr-' + menu.icon]: true }"></div>
          <div class="name">{{ menu.title }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>
