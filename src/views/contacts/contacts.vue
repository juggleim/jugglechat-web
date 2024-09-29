<script setup>
import utils from "../../common/utils";
import ContactDetail from "./detail.vue";
import { useRouter } from "vue-router";
import Dropmenu from "./dropmenu.vue";
import { reactive, getCurrentInstance, watch } from "vue";
import { CONTACT_TAB_TYPE, RESPONSE, EVENT_NAME }  from "../../common/enum";
import AisdeHeader from "../../components/aside-header.vue";
import im from "../../common/im";
import { STORAGE } from "../../common/enum";
import Storage from "../../common/storage";
import { Friend, Group } from "../../services/index";
import common from "../../common/common";
import emitter from "../../common/emmit";

let { ConversationType } = im.getCurrent();
let tabs = [
    { name: '好友', type: ConversationType.PRIVATE, icon: 'contact', isActive: true },
    { name: '群组', type: ConversationType.GROUP, icon: 'group', isActive: false },
  ];
let contacts = [
    // { type: ConversationType.PRIVATE, id: '@thompson_jasmine1', name: 'Jasmine Thompson1', avatar: 'https://i.75ll.com/up/71/83/b3/7426da9a842ec3d438a8426c40b38371.jpg', isSelected: false },
    // { type: ConversationType.PRIVATE, id: '@thompson_jasmine2', name: 'Jasmine Thompson2', avatar: 'https://i.75ll.com/up/71/83/b3/7426da9a842ec3d438a8426c40b38371.jpg', isSelected: false },
    // { type: ConversationType.PRIVATE, id: '@thompson_jasmine3', name: 'Jasmine Thompson3', avatar: 'https://i.75ll.com/up/71/83/b3/7426da9a842ec3d438a8426c40b38371.jpg', isSelected: false },
    // { type: ConversationType.PRIVATE, id: '@thompson_jasmine4', name: 'Jasmine Thompson4', avatar: 'https://i.75ll.com/up/71/83/b3/7426da9a842ec3d438a8426c40b38371.jpg', isSelected: false },
    // { type: ConversationType.PRIVATE, id: '@thompson_jasmine5', name: 'Jasmine Thompson5', avatar: 'https://i.75ll.com/up/71/83/b3/7426da9a842ec3d438a8426c40b38371.jpg', isSelected: false },
    // { type: ConversationType.PRIVATE, id: '@thompson_jasmine6', name: 'Jasmine Thompson6', avatar: 'https://i.75ll.com/up/71/83/b3/7426da9a842ec3d438a8426c40b38371.jpg', isSelected: false },
  ];
let groups = [
    // { type: ConversationType.GROUP, id: 'groupid1',  name: '群组1', avatar: 'https://tupian.qqw21.com/article/UploadPic/2018-10/201810102082475834.jpg', isSelected: false },
    // { type: ConversationType.GROUP, id: 'groupid2',  name: '群组2', avatar: 'https://tupian.qqw21.com/article/UploadPic/2018-10/201810102082475834.jpg', isSelected: false },
    // { type: ConversationType.GROUP, id: 'groupid3',  name: '群组3', avatar: 'https://tupian.qqw21.com/article/UploadPic/2018-10/201810102082475834.jpg', isSelected: false },
    // { type: ConversationType.GROUP, id: 'groupid4',  name: '群组4', avatar: 'https://tupian.qqw21.com/article/UploadPic/2018-10/201810102082475834.jpg', isSelected: false },
    // { type: ConversationType.GROUP, id: 'groupid5',  name: '群组5', avatar: 'https://tupian.qqw21.com/article/UploadPic/2018-10/201810102082475834.jpg', isSelected: false },
    // { type: ConversationType.GROUP, id: 'groupid6',  name: '群组6', avatar: 'https://tupian.qqw21.com/article/UploadPic/2018-10/201810102082475834.jpg', isSelected: false },
  ];
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
  if(utils.isEqual(state.currentTab,ConversationType.PRIVATE )){
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
  if(utils.isEqual(tab.type, ConversationType.PRIVATE)){
    getFriends();
  }
  if(utils.isEqual(tab.type, ConversationType.GROUP)){
    getGroups();
  }
  state.current = {};
  utils.map(state.tabs, (_tab) => {
    let isActive = utils.isEqual(_tab.type, tab.type);
    _tab.isActive = isActive;
    return _tab;
  });
}

function getFriends(startUserId = ''){
  if(!utils.isEmpty(contacts) && utils.isEmpty(startUserId)){
    return state.currentList = contacts;
  }
  let user = Storage.get(STORAGE.USER_TOKEN);
  Friend.getList({ userId: user.id, count: 20, startUserId }).then((result) => {
    let { data: { items }, code } = result;
    let list = utils.map(items, (item) => {
      let { user_id, nickname, avatar } = item;
      return {
        id: user_id,
        type: ConversationType.PRIVATE, 
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
    let list = utils.map(items, (item) => {
      let { group_id, group_name, group_portrait } = item;
      return {
        id: group_id,
        type: ConversationType.GROUP, 
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
        <ul class="nav nav-tabs nav-tabs-line">
          <li class="nav-item" v-for="tab in state.tabs">
            <button class="nav-link wr" :class="{['wr-' + tab.icon]: true, 'active': tab.isActive}" type="button" @click="onTab(tab)">{{ tab.name }}</button>
          </li>
        </ul>
      </div>
      <div class="tyn-aside-body" data-simplebar>
        <!-- <div class="tyn-aside-search">
          <div class="form-group tyn-pill">
            <div class="form-control-wrap">
              <div class="form-control-icon start wr wr-search"></div>
              <input type="text" class="form-control form-control-solid" placeholder="Search contact / group" />
            </div>
          </div>
        </div> -->
        <div class="tab-content">
          <div class="tab-pane show active">
            <ul class="tyn-aside-list">
              <li class="tyn-aside-item js-toggle-main" 
                v-for="item in state.currentList" 
                :class="{'active': item.isSelected}" 
                @click="onShowProfile(item)">
                <div class="tyn-media-group">
                  <div class="tyn-media tyn-size-rg contact-avatar" :style="{'background-image': 'url(' + item.avatar +')'}">
                  </div>
                  <div class="tyn-media-col">
                    <div class="tyn-media-row">
                      <h6 class="name">{{ item.name }}</h6>
                    </div>
                  </div>
                </div>
              </li>
              <li class="tyn-aside-item js-toggle-main name tyn-aside-nothing" v-if="state.currentList.length == 0">没有更多了</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <ContactDetail :current="state.current"></ContactDetail>
  </div>
</template>