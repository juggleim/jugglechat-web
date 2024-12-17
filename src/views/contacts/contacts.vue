<script setup>
import utils from "../../common/utils";
import ContactDetail from "./detail.vue";
import { useRouter } from "vue-router";
import Dropmenu from "./dropmenu.vue";
import { reactive, getCurrentInstance, watch } from "vue";
import { CONTACT_TAB_TYPE, RESPONSE, EVENT_NAME, CONTACT_TYPE, FRIEND_APPLY_STATUS }  from "../../common/enum";

import AisdeHeader from "../../components/aside-header.vue";
import AisdeFooter from "../../components/aside-footer.vue";

import im from "../../common/im";
import { STORAGE } from "../../common/enum";
import Storage from "../../common/storage";
import { Friend, Group } from "../../services/index";
import common from "../../common/common";
import emitter from "../../common/emmit";

let tabs = [
    { name: '联系人', type: CONTACT_TYPE.FRIEND, icon: 'contact', isActive: true },
    { name: '新朋友', type: CONTACT_TYPE.NEW_FRIEND, unreadCount: 0, icon: 'adduser', isActive: false },
    { name: '群组', type: CONTACT_TYPE.GROUP, icon: 'group', isActive: false },
  ];
let contacts = [];
let groups = [];
let newContacts = [];
const context = getCurrentInstance();
let state = reactive({
  tabs: tabs,
  currentTab: tabs[0].type,
  contacts: contacts,
  groups: groups,
  currentList: contacts,
  current: {},
  isShowAddFriend: false,
});

emitter.$on(EVENT_NAME.ON_ADDED_FRIEND, (friend) => {
  state.contacts.push(friend);
  if(utils.isEqual(state.currentTab, CONTACT_TAB_TYPE.FRIEND )){
    state.currentList.push(friend);
  }
});
function onShowProfile(item){
  state.currentList.map((_item) => {
    _item.isSelected = utils.isEqual(item.id, _item.id);
    return _item;
  });
  state.current = item;
}
function onTab(tab){
  if(utils.isEqual(tab.type, CONTACT_TYPE.FRIEND)){
    getFriends();
  }
  if(utils.isEqual(tab.type, CONTACT_TYPE.GROUP)){
    getGroups();
  }
  if(utils.isEqual(tab.type, CONTACT_TYPE.NEW_FRIEND)){
    getNewFriends();
  }
  state.current = {};
  utils.map(state.tabs, (_tab) => {
    let isActive = utils.isEqual(_tab.type, tab.type);
    _tab.isActive = isActive;
    return _tab;
  });
}

function getNewFriends(start = 0){
  Friend.getNewList({ start, count: 50, order: 0 }).then((result) => {
    let { data: { items = [] }, code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({ text: `获取失败: ${error.code}`, icon: 'error' });
    }

    let user = Storage.get(STORAGE.USER_TOKEN);

    let list = utils.map(items, (item) => {
      let { id, sponsor, recipient, status = FRIEND_APPLY_STATUS.APPLYING } = item;
      
      let content = `${sponsor.nickname || sponsor.user_id} 添加你为好友`;
      let _user = sponsor;
      let avatar = sponsor.avatar || common.getTextAvatar(sponsor.nickname || sponsor.user_id);
      let isOneSelf = false;
      if(utils.isEqual(sponsor.user_id, user.id)){
        content = `你添加 ${recipient.nickname || recipient.user_id} 为好友`;
        avatar = recipient.avatar || common.getTextAvatar(recipient.nickname || recipient.user_id);
        _user = recipient;
        isOneSelf = true;
      }
      return {
        id: utils.getUUID(),
        type: CONTACT_TYPE.NEW_FRIEND, 
        name: content, 
        avatar: avatar,
        status: status,
        user: _user,
        isOneSelf: isOneSelf,
        statusName: getFriendApplyName(status),
        isSelected: false
      };
    });
    if(start == 0){
      newContacts = list;
    }else{
      newContacts = newContacts.concat(list);
    }
    
    state.currentList = newContacts;
  });
}
function getFriendApplyName(status){
  let statusMap = {};
  statusMap[FRIEND_APPLY_STATUS.APPLYING] = '待处理';
  statusMap[FRIEND_APPLY_STATUS.ACCEPTED] = '已添加';
  statusMap[FRIEND_APPLY_STATUS.DECLINED] = '已拒绝';
  statusMap[FRIEND_APPLY_STATUS.EXPIRED] = '已过期';
  return statusMap[status] || '';
}
function getFriends(startUserId = ''){
  if(!utils.isEmpty(contacts) && utils.isEmpty(startUserId)){
    return state.currentList = contacts;
  }
  let user = Storage.get(STORAGE.USER_TOKEN);
  Friend.getList({ userId: user.id, count: 20, startUserId }).then((result) => {
    let { data: { items }, code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({ text: `获取失败: ${error.code}`, icon: 'error' });
    }

    let list = utils.map(items, (item) => {
      let { user_id, nickname, avatar } = item;
      return {
        id: user_id,
        type: CONTACT_TYPE.FRIEND, 
        name: nickname, 
        avatar: avatar || common.getTextAvatar(nickname), 
        isSelected: false
      };
    });
    contacts = contacts.concat(list);
    state.currentList = contacts;
  });
}

function getGroups(startId = ''){
  if(!utils.isEmpty(groups) && utils.isEmpty(startId)){
    return state.currentList = groups;
  }
  let user = Storage.get(STORAGE.USER_TOKEN);
  Group.getList({ count: 20, startId }).then((result) => {
    let { data: { items }, code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({ text: `获取失败: ${error.code}`, icon: 'error' });
    }

    let list = utils.map(items, (item) => {
      let { group_id, group_name, group_portrait } = item;
      return {
        id: group_id,
        type: CONTACT_TYPE.GROUP, 
        name: group_name, 
        avatar: group_portrait, 
        isSelected: false
      };
    });
    groups = groups.concat(list);
    state.currentList = groups;
  });
}

let user = Storage.get(STORAGE.USER_TOKEN);
if (utils.isEmpty(user)) {
  router.replace({ name: 'Login' });
}
im.connect(user, {
  success: (_user) => {
    console.log('contacts connect success', _user)
  },
  error: () => {
    router.replace({ name: 'Login' });
  }
});

const router = useRouter();
let useRouterCurrent = reactive(router);
watch(useRouterCurrent, (val) => {
  getFriends();
})
getFriends();
</script>
<template>
  <div class="tyn-contact tyn-content tyn-content-full-height tyn-chat has-aside-base">
    <div class="tyn-aside tyn-contact-aside">
      <AisdeHeader :title="'通讯录'"></AisdeHeader>
      <div class="tyn-aside-row pt-1">
        <ul class="nav nav-tabs nav-tabs-line jg-contact-navs">
          <li class="nav-item" v-for="tab in state.tabs">
            <div class="nav-unreadcount" v-if="tab.unreadCount > 0">{{ tab.unreadCount }}</div>
            <button class="nav-link wr" :class="{['wr-' + tab.icon]: true, 'active': tab.isActive}" type="button" @click="onTab(tab)">{{ tab.name }}</button>
          </li>
        </ul>
      </div>
      <div class="tyn-aside-body">
        <div class="tab-content">
          <div class="tab-pane show active">
            <ul class="tyn-aside-list">
              <li class="tyn-aside-item js-toggle-main" 
                v-for="item in state.currentList" 
                :class="{'active': item.isSelected}" 
                @click="onShowProfile(item)">
                <div class="tyn-media-group">
                  <div class="tyn-media tyn-size-rg contact-avatar" :style="{'background-image': 'url(' + item.avatar +')'}"></div>
                  <div class="tyn-media-col">
                    <div class="tyn-media-row"><h6 class="name">{{ item.name }}</h6></div>
                  </div>
                  <div class="jg-friend-applystatus" v-if="utils.isEqual(item.type, CONTACT_TYPE.NEW_FRIEND)">{{ item.statusName }}</div>
                </div>
              </li>
              <li class="tyn-aside-item js-toggle-main name tyn-aside-nothing" v-if="state.currentList.length == 0">没有更多了</li>
            </ul>
          </div>
        </div>
      </div>
      <AisdeFooter></AisdeFooter>
    </div>
    <ContactDetail :current="state.current"></ContactDetail>
  </div>
</template>