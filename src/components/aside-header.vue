<script setup>
const props = defineProps(['title']);
import { reactive, getCurrentInstance } from "vue";
import ModalFriendAdd from "../components/modal-friend-add.vue";
import utils from "../common/utils";
import commcon from "../common/common";
import { STORAGE, RESPONSE, EVENT_NAME } from "../common/enum";
import Storage from "../common/storage";
import { Friend } from "../services";
import emitter from "../common/emmit";
import im from "../common/im";
let juggle = im.getCurrent();

let state = reactive({
  isShowAddFriend: false
});
const context = getCurrentInstance();

function onShowFriendAdd(isShow){
  state.isShowAddFriend = isShow;
}
function onFriendAddCancel(){
  onShowFriendAdd(false);
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
</script>

<template>
  <div class="tyn-aside-head">
    <div class="tyn-aside-head-text">
      <h4 class="tyn-aside-title tyn-title">{{ props.title }}</h4>
    </div>
    <div class="tyn-aside-head-tools">
      <ul class="tyn-list-inline gap gap-3">
        <li>
          <button class="btn btn-icon btn-light btn-md wr wr-plus" @click="onShowFriendAdd(true)"></button>
        </li>
      </ul>
    </div>
    <ModalFriendAdd :is-show="state.isShowAddFriend" @oncancel="onFriendAddCancel" @onconfirm="onFriendAddConfirm"></ModalFriendAdd>
  </div>
</template>
