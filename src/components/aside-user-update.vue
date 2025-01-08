<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";
import Asider from "./aside.vue";
import im from "../common/im";
import { User } from "../services/index";
import { RESPONSE, STORAGE, EVENT_NAME } from "../common/enum";
import Storage from "../common/storage";

const props = defineProps(["isShow", "disabledClose"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let avatars = common.getAvatars();

let current = { };
let user = Storage.get(STORAGE.USER_TOKEN);
avatars = utils.map(avatars, (url) => {
  let isSelected = utils.isEqual(url, user.portrait);
  let _avatar = { url, isSelected };
  if(isSelected){
    current = _avatar;
  }
  return _avatar;
});
if(utils.isEmpty(current)){
  current = avatars[0];
  current.isSelected = true;
}

let state = reactive({
  avatars: avatars,
  current: current,
  username: user.name || '',
  isNameError: false,
});

function onCancel(){
  emit('oncancel', {});
}

let isSaveingUser = false;
function onConfirm(){
  let { current, username } = state;
  if (utils.isEmpty(username)) {
    return state.isNameError = true;
  }
  let { id } = user;

  if(isSaveingUser){
    return;
  }
  isSaveingUser = true;
  let _user = { id, portrait: current.url, name: username };
  User.update(_user).then((result) => {
    isSaveingUser = false;
    if(!utils.isEqual(result.code, RESPONSE.SUCCESS)){
      let errorCode = result.code;
      return context.proxy.$toast({
        text: `保存失败：${errorCode}`,
        icon: 'error'
      });
    }
    
    let existUser = Storage.get(STORAGE.USER_TOKEN);
    existUser = utils.extend(existUser, _user);
    Storage.set(STORAGE.USER_TOKEN, existUser);
    emitter.$emit(EVENT_NAME.ON_USER_INFO_UPDATE, { user: existUser });

    onCancel();
  });
}

function onSelected(avatar){
  let list = utils.map(state.avatars, (_avatar) => {
    _avatar.isSelected = utils.isEqual(_avatar.url, avatar.url);
    return _avatar;
  });
  utils.extend(state, { current: avatar, avatars: list });
}
function onNameInput(){
  state.isNameError = false;
}

</script>

<template>
  <Asider :is-show="props.isShow" :title="'修改信息'" @oncancel="onCancel" :disabled-close="props.disabledClose">
    <div class="jg-aside-userupdate-body">
      <div class="form-group">
        <input type="text" class="form-control" :class="{'form-control-warn': state.isNameError}" placeholder="输入昵称" v-model="state.username" @input="onNameInput()">
      </div>
      <div class="form-group form-avatars">
        <div class="form-avatar wr" @click.stop="onSelected(avatar)" :class="{'wr-mark form-avatar-selected': avatar.isSelected}" v-for="avatar in state.avatars" :style="{ 'background-image': 'url(' + avatar.url + ')' }"></div>
      </div>
      <div class="form-group">
        <div class="form-control-wrap">
          <a class="btn btn-primary-soft w-100" @click="onConfirm()">保存</a>
        </div>
      </div>
    </div>
  </Asider>
</template>
