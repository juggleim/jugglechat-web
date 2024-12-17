<script setup>
import utils from "../../common/utils";
import { useRouter } from "vue-router";
import { reactive, getCurrentInstance, watch } from "vue";

import im from "../../common/im";
import { SETTING_TYPE, STORAGE, RESPONSE, EVENT_NAME }  from "../../common/enum";
import common from "../../common/common";
import Storage from "../../common/storage";
import { User } from "../../services/index";
import emitter from "../../common/emmit";

const context = getCurrentInstance();
let { ConversationType } = im.getCurrent();
const router = useRouter();
const props = defineProps(["type"]);
let avatars = common.getAvatars();

let currentAvatar = { };
let user = Storage.get(STORAGE.USER_TOKEN);
avatars = utils.map(avatars, (url) => {
  let isSelected = utils.isEqual(url, user.portrait);
  let _avatar = { url, isSelected };
  if(isSelected){
    currentAvatar = _avatar;
  }
  return _avatar;
});
if(utils.isEmpty(currentAvatar)){
  currentAvatar = avatars[0];
  currentAvatar.isSelected = true;
}

let state = reactive({
  type: props.type,
  avatars: avatars,
  currentAvatar: currentAvatar,
  username: user.name || '',
  isNameError: false,
});

let isSaveingUser = false;
function onSaveUser(){
  let { currentAvatar, username: name } = state;
  if (utils.isEmpty(name)) {
    return state.isNameError = true;
  }
  if(isSaveingUser){
    return;
  }
  isSaveingUser = true;
  let _user = { id: user.id, portrait: currentAvatar.url, name };
  User.update(_user).then((result) => {
    isSaveingUser = false;
    if(!utils.isEqual(result.code, RESPONSE.SUCCESS)){
      let errorCode = result.code;
      return context.proxy.$toast({
        text: `保存失败：${errorCode}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `保存成功`,
      icon: 'success'
    });
    Storage.set(STORAGE.USER_TOKEN, { ...user, ..._user });
    emitter.$emit(EVENT_NAME.ON_USER_INFO_UPDATE, { user: _user })
  });
}

function onSelected(avatar){
  let list = utils.map(state.avatars, (_avatar) => {
    _avatar.isSelected = utils.isEqual(_avatar.url, avatar.url);
    return _avatar;
  });
  utils.extend(state, { currentAvatar: avatar, avatars: list });
}
function onNameInput(){
  state.isNameError = false;
}

watch(() => props.type, () => {
  state.type = props.type;
})
</script>
<template>
  <div class="tyn-main tyn-content-inner">
    <div class="setting-content">
      <div class="jg-setting-body" v-if="utils.isEqual(state.type, SETTING_TYPE.USER)">
        <h5 class="pb-2">用户设置</h5>
        <div class="form-group">
          <input type="text" class="form-control" :class="{'form-control-warn': state.isNameError}" placeholder="输入昵称" v-model="state.username" @input="onNameInput()">
        </div>
        <div class="form-group form-avatars">
          <div class="jg-formuser-avatar" v-for="avatar in state.avatars" >
            <div class="form-avatar wr" @click.stop="onSelected(avatar)" :class="{'wr-mark form-avatar-selected': avatar.isSelected}" :style="{ 'background-image': 'url(' + avatar.url + ')' }"></div>
          </div>
        </div>
        <div class="form-group">
          <div class="form-control-wrap">
            <a class="btn btn-primary-soft w-100" @click="onSaveUser()">保存</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>