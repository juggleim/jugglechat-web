<script setup>
const props = defineProps(['title']);
import { reactive, getCurrentInstance } from "vue";
import ModalFriendAdd from "../components/modal-friend-add.vue";
import AisdeSearch from './aside-search.vue';
import utils from "../common/utils";
import commcon from "../common/common";
import { STORAGE, RESPONSE, EVENT_NAME } from "../common/enum";
import Storage from "../common/storage";
import { Friend } from "../services";
import emitter from "../common/emmit";
import im from "../common/im";
import HeaderDropMenu from '../components/header-menu.vue';

const emit = defineEmits(["onnav"]);

let juggle = im.getCurrent();

let state = reactive({
  isShowAddFriend: false,
  isDesktop: juggle.isDesktop(),
  isShowAddMenu: false,
  isShowSettingMenu: false,
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
</script>

<template>
  <div class="tyn-aside-head" :class="{ 'tyn-aside-desktop': state.isDesktop }" @mouseleave="onHideMenu()">
    <div class="tyn-aside-head-tools">
      <ul class="tyn-list-inline jg-asider-tools">
        <li class="jg-asider-tool">
          <button class="btn btn-icon btn-light btn-md wr wr-more-list" @click="onShowSettingMenu(true)"></button>
          <HeaderDropMenu :is-show="state.isShowSettingMenu"></HeaderDropMenu>
        </li>
        <li v-if="state.isDesktop" class="jg-asider-tool jg-asider-tool-search">
          <AisdeSearch @onnav="onNavChat"></AisdeSearch>
        </li>
        <li class="jg-asider-tool">
          <button class="btn btn-icon btn-light btn-md wr wr-plus" @click="onShowAddMenu(true)"></button>
          <HeaderDropMenu :is-show="state.isShowAddMenu" :class="'tyn-header-create-list'"></HeaderDropMenu>
        </li>
      </ul>
    </div>
    <ModalFriendAdd :is-show="state.isShowAddFriend" @oncancel="onFriendAddCancel" @onconfirm="onFriendAddConfirm"></ModalFriendAdd>
  </div>
</template>
