<script setup>
const props = defineProps(['title']);
import { reactive, getCurrentInstance } from "vue";
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
import ModalAddMemberGroup from "./modal-add-member-group.vue";
import { Group, User } from "../services/index";
import ModalUser from "./modal-user.vue";

const emit = defineEmits([]);
const router = useRouter();

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
    { id: `${Date.now()}`, name: '消息', icon: 'message', event: ASIDE_MENU_TYPE.MESSAGE, isActive: utils.isEqual(path, '/conversation') },
    { id: `${SYS_CONVERSATION_FRIEND}`, name: '通讯录', icon: 'contact', event: ASIDE_MENU_TYPE.CONTACT, isActive: utils.isEqual(path, '/contacts'), unreadCount: 0 },
    { id: `${Date.now()}`, name: '设置', icon: 'setting', event: ASIDE_MENU_TYPE.USER_SETTING, isActive: utils.isEqual(path, '/setting') },
  ],
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
im.connect(user, {
  success: (_user) => {
    juggle.getConversation({ conversationId: SYS_CONVERSATION_FRIEND, conversationType: ConversationType.SYSTEM }).then(({ conversation }) => {
      let index = utils.find(state.settingMenus, (menu) => { 
        return utils.isEqual(menu.event, ASIDE_MENU_TYPE.CONTACT)
      });
      let menu = state.settingMenus[index];
      menu.unreadCount = conversation.unreadCount;
    });
  },
  error: () => {}
});

const context = getCurrentInstance();

function onMenuClick(menu){
  let { event } = menu;
  if(utils.isEqual(event, ASIDE_MENU_TYPE.MESSAGE)){
    router.push({ name: 'ConversationList' });
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.CONTACT)){
    router.push({ name: 'Contacts' });
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_SETTING)){
    router.push({ name: 'Settings' });
  }
}

</script>

<template>
  <div class="tyn-aside-footer" :class="{ 'tyn-aside-desktop': state.isDesktop }">
    <div class="tyn-aside-head-tools">
      <ul class="tyn-list-inline jg-asider-tools">
        <li class="jg-asider-tool" v-for="menu in state.settingMenus">
          <div class="jg-asider-footer-item" @click="onMenuClick(menu)" :class="[menu.isActive ? 'jg-footer-active' : '']">
            <div class="nav-unreadcount" v-if="menu.unreadCount > 0">{{ menu.unreadCount }}</div>
            <div class="icon wr" :class="{ ['wr-' + menu.icon]: true }"></div>
            <div class="name">{{ menu.name }}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
