<script setup>
import im from "../common/im";
import { reactive } from "vue";
import utils from "../common/utils";
import common from "../common/common";
const props = defineProps(["isShow", "isShowClose", "user"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let avatars = common.getAvatars();

let current = { };
avatars = utils.map(avatars, (url) => {
  let isSelected = utils.isEqual(url, props.user.portrait);
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
  username: props.isShowClose ? props.user.name : '',
  isNameError: false,
});

function onCancel(){
  emit('oncancel', {});
}
function onConfirm(){
  let { current, username: name } = state;
  if (utils.isEmpty(name)) {
    return state.isNameError = true;
  }
  let { id } = props.user;
  emit('onconfirm', { id, portrait: current.url, name });
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
  <div class="modal tyn-modal tyn-user-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h5 class="pb-2">用户设置</h5>
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
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close" v-if="props.isShowClose"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{'show': props.isShow}"></div>  
  </div>
</template>
