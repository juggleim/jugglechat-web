<script setup>
import im from "../common/im";
import { reactive, watch } from "vue";
import utils from "../common/utils";
import { User } from "../services/index";
import { RESPONSE } from "../common/enum";
import common from "../common/common";

const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let juggle = im.getCurrent();
let state = reactive({
  phone: '',
  users: []
});
function onCancel() {
  emit('oncancel', {});
}
function onSearch() {
  let { phone } = state;
  if (utils.isEmpty(phone)) {
    return state.errorMsg = '手机号不能为空';
  }
  if (!utils.isPhoneNumber(phone)) {
    return state.errorMsg = '手机号格式不正确';
  }
  User.search({ phone }).then((result) => {
    let { code, data } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      utils.extend(state, { errorMsg: '没有找到用户', users: [] });
      return;
    }
    let { items } = data;
    let users = utils.map(items, (item) => {
      let { avatar, nickname } = item;
      item.avatar = avatar || common.getTextAvatar(nickname);
      return item;
    });
    utils.extend(state, { users });
  });
}
function onAdd(user){
  if(user.is_friend){
    return;
  }
  emit('onconfirm', { friendId: user.user_id, user });
  utils.extend(state, { phone: '', users: [] });
}
function onInput(){
  state.errorMsg = '';
  if(utils.isEqual(0, state.phone.length)){
    state.users = [];
  }
}
watch(() => props.isShow, () => {
  if(!props.isShow){
    utils.extend(state, { users: [], phone: '' })
  }
});
</script>
<template>
  <div class="modal tyn-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-sm modal-friend-add">
      <div class="modal-content border-0">
        <div class="modal-body">
          <div class="tyn-aside-search">
            <div class="form-group tyn-pill">
              <div class="form-control-wrap">
                <div class="form-control-icon start wr wr-search"></div>
                <input type="text" class="form-control form-control-solid" placeholder="输入手机号回车搜索好友"
                  @keydown.enter="onSearch" v-model="state.phone" @input="onInput"/>
                <label class="form-label" for="email-address">
                  <span class="small ms-2 text-danger">{{ state.errorMsg }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="form-check form-check-algin">
            <div class="form-check-label" v-for="user in state.users">
              <div class="tyn-media-group">
                <div class="tyn-media tyn-size-md d-none d-sm-inline-flex tyn-conver-avatar"
                  :style="{ 'background-image': 'url(' + user.avatar + ')' }">
                </div>
                <div class="tyn-media-col">
                  <div class="tyn-media-row m-friend-name">
                    <h6 class="name">{{ user.nickname }}</h6>
                  </div>
                </div>
                <div class="tyn-media-col">
                  <div class="tyn-media-row m-friend-add-btn" @click.stop="onAdd(user)">
                    <div class="wr" :class="[user.is_friend ? 'wr-success' : 'wr-plus']"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="onCancel()"
          class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
