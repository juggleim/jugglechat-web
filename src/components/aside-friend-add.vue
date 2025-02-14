<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";
import Asider from "./aside.vue";
import im from "../common/im";
import { User, Friend } from "../services/index";
import { RESPONSE, STORAGE } from "../common/enum";
import Storage from "../common/storage";

const context = getCurrentInstance();
const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel"]);
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
    utils.extend(state, { users: items });
  });
}
function onAdd(_user){
  if(_user.is_friend){
    return;
  }
  utils.extend(state, { phone: '', users: [] });
  let friend = { friendId: _user.user_id };
  let user = Storage.get(STORAGE.USER_TOKEN);
  Friend.add(friend).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: `添加好友失败：${code}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `已发送好友添加请求`,
      icon: 'success'
    });
    setTimeout(() => {
      emit('oncancel', {});
    }, 200);
  });
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
  <Asider :is-show="props.isShow" :title="'添加好友'" @oncancel="onCancel">
    <div class="jg-aside-friend-body">
      <div class="tyn-aside-search">
        <div class="form-group tyn-pill">
          <div class="form-control-wrap">
            <div class="form-control-icon start wr wr-search"></div>
            <input type="search" class="form-control form-control-solid" placeholder="输入手机号回车搜索好友"
              @keydown.enter.self="onSearch" v-model="state.phone" @input="onInput"/>
            <label class="form-label" for="email-address">
              <span class="small ms-2 text-danger">{{ state.errorMsg }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="form-check form-check-algin">
        <div class="form-check-label" v-for="user in state.users">
          <div class="tyn-media-group">
            <div class="tyn-media tyn-size-md tyn-conver-avatar"
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
  </Asider>
</template>
