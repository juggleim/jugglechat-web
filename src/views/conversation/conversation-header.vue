<script setup>
import { reactive, getCurrentInstance, nextTick, watch } from "vue";
import HeaderDropMenu from '../../components/header-menu.vue';
import { ASIDE_MENU_TYPE } from "../../common/enum";
import utils from "../../common/utils";
import AsiderFriendAdd from "../../components/aside-friend-add.vue";
import AsiderGroupAddMember from "../../components/aside-group-add-member.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps(["isShow"]);

let state = reactive({
  addMenus: [
    { name: '添加好友', icon: 'adduser', event: ASIDE_MENU_TYPE.ADD_FRIREND },
    { name: '创建群组', icon: 'group', event: ASIDE_MENU_TYPE.ADD_GROUP },
  ],
  isShowAddMenu: false,
  isShowAddFriend: false,
  isShowCreateGroup: false,
  isShowAddButton: true
});

function onShowAddMenu(isShow){
  state.isShowAddMenu = isShow;
}
function onDropMenuClick(menu){
  let { event } = menu;
  onShowAddMenu();
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_FRIREND)){
    onShowAddFriend(true)
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.ADD_GROUP)){
    onShowCreateGroup(true)
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
  <ul class="jg-h5header">
    <li class="jg-h5header-left"></li>
    <li class="jg-h5header-title">JuggleChat</li>
    <li class="jg-h5header-right" v-if="state.isShowAddButton">
      <div class="jg-asider-footer-item" @click="onShowAddMenu(true)">
        <div class="icon wr wr-plus"></div>
        <div class="name"></div>
      </div>
      <HeaderDropMenu @onemit="onDropMenuClick" :is-show="state.isShowAddMenu" :menus="state.addMenus" :class="'tyn-h5header-create-list'" @onhide="onShowAddMenu(false)"></HeaderDropMenu>
    </li>
  </ul>
  <AsiderFriendAdd :is-show="state.isShowAddFriend" @oncancel="onShowAddFriend(false)"></AsiderFriendAdd>
  <AsiderGroupAddMember :is-show="state.isShowCreateGroup" :conversation="{}" :members="[]" @oncancel="onShowCreateGroup(false)"></AsiderGroupAddMember>
</template>
