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
  i18n: common.i18n(),
  phone: '',
  users: []
});
function onCancel() {
  emit('oncancel', {});
}

function onSearch() {
  let { phone, i18n } = state;
  if (utils.isEmpty(phone)) {
    return state.errorMsg = i18n.SEARCH_FRIEND.PHONE_EMPTY;
  }
  if (!utils.isPhoneNumber(phone)) {
    return state.errorMsg = i18n.SEARCH_FRIEND.PHONE_ERROR;
  }
  User.search({ phone }).then((result) => {
    let { code, data } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      utils.extend(state, { errorMsg: i18n.SEARCH_FRIEND.USER_NONE, users: [] });
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
        text: common.errorText(code),
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: state.i18n.SEARCH_FRIEND.REQUEST_SENT,
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
  <Asider :is-show="props.isShow" :title="state.i18n.SEARCH_FRIEND.TITLE" @oncancel="onCancel">
    <div class="jg-aside-friend-body">
      <div class="tyn-aside-search">
        <div class="form-group tyn-pill">
          <div class="form-control-wrap">
            <div class="form-control-icon start wr wr-search"></div>
            <input type="search" class="form-control form-control-solid" :placeholder="state.i18n.SEARCH_FRIEND.PLACEHOLDER"
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
