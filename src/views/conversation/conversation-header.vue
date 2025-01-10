<script setup>
import { reactive, getCurrentInstance, nextTick, watch } from "vue";
import HeaderDropMenu from '../../components/header-menu.vue';
import { ASIDE_MENU_TYPE } from "../../common/enum";
import utils from "../../common/utils";
import AsiderFriendAdd from "../../components/aside-friend-add.vue";
import AsiderGroupAddMember from "../../components/aside-group-add-member.vue";
import { useRouter } from "vue-router";
import Perch from "../../components/perch.vue";

const router = useRouter();
const props = defineProps(["isShow"]);

let state = reactive({
  addMenus: [
    { name: '添加好友', icon: 'adduser', event: ASIDE_MENU_TYPE.ADD_FRIREND },
    { name: '创建群组', icon: 'group', event: ASIDE_MENU_TYPE.ADD_GROUP },
  ],
  tbars: [
    { name: '消息', url: 'ConversationList', icon: 'hmsg', event: ASIDE_MENU_TYPE.MESSAGE },
    { type: 'line' },
    { name: '通讯录', url: 'Contacts', icon: 'hcontact', event: ASIDE_MENU_TYPE.CONTACT },
    { type: 'line' },
    { name: '设置', url: 'Setting', icon: 'hsetting', event: ASIDE_MENU_TYPE.SETTING },
  ],
  isShowAddMenu: false,
  isShowAddFriend: false,
  isShowCreateGroup: false,
  isShowAddButton: true,
  isShowNavBar: false,
});

function onShowAddMenu(isShow){
  state.isShowAddMenu = isShow;
}
function onShowNavBar(isShow){
  state.isShowNavBar = isShow;
}

let { currentRoute: { _value: { name } } } = router;
function onDropMenuClick(menu){
  let { event } = menu;
  onShowAddMenu();
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_FRIREND)){
    onShowAddFriend(true)
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_GROUP)){
    onShowCreateGroup(true)
  }
  if(menu.url && menu.url != name){
    router.push({ name: menu.url });
  }
}
function onShowAddFriend(isShow){
  state.isShowAddFriend = isShow;
}
function onShowCreateGroup(isShow){
  state.isShowCreateGroup = isShow;
}
</script>

<template>
  <div class="jg-h5header-box">
    <Perch></Perch>
    <ul class="jg-h5header">
      <li class="jg-h5header-left">
        <div class="jg-asider-footer-item" @click="onShowNavBar(true)">
          <div class="icon wr wr-more-list"></div>
          <div class="name"></div>
        </div>
        <HeaderDropMenu @onemit="onDropMenuClick" :is-show="state.isShowNavBar" :menus="state.tbars" :class="'tyn-h5header-nav-list'" @onhide="onShowNavBar(false)"></HeaderDropMenu>
      </li>
      <li class="jg-h5header-title">JuggleChat</li>
      <li class="jg-h5header-right" v-if="state.isShowAddButton">
        <div class="jg-asider-footer-item" @click="onShowAddMenu(true)">
          <div class="icon wr wr-plus-w600"></div>
          <div class="name"></div>
        </div>
        <HeaderDropMenu @onemit="onDropMenuClick" :is-show="state.isShowAddMenu" :menus="state.addMenus" :class="'tyn-h5header-create-list'" @onhide="onShowAddMenu(false)"></HeaderDropMenu>
      </li>
    </ul>
  </div>
  
  
  <AsiderFriendAdd :is-show="state.isShowAddFriend" @oncancel="onShowAddFriend(false)"></AsiderFriendAdd>
  <AsiderGroupAddMember :is-show="state.isShowCreateGroup" :conversation="{}" :members="[]" @oncancel="onShowCreateGroup(false)"></AsiderGroupAddMember>
</template>
