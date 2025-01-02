<script setup>
import im from "../common/im";
import { reactive, getCurrentInstance, watch } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import { STORAGE, RESPONSE, EVENT_NAME }  from "../common/enum";
import { User } from "../services/index";
import emitter from "../common/emmit";
import Storage from "../common/storage";
import UserLoginModal from "../components/modal-user-login.vue";

const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel"]);
const context = getCurrentInstance();

let state = reactive({
  accounts: [],
  isShowLogin: false,
});

function onCancel(){
  emit('oncancel', {});
}

function onSelected(account, index){
  if(account.isUsed){
    return;
  }
  Storage.set(STORAGE.USER_TOKEN, account);
  setTimeout(() => {
    location.reload();
  }, 100);
}
function onShowLogin(isShow){
  console.log(state.isShowLogin)
  state.isShowLogin = isShow;
}
function onRemove(index){
  state.accounts.splice(index, 1);
  Storage.set(STORAGE.USERS, state.accounts);
}
function getAccounts(){
  let user = Storage.get(STORAGE.USER_TOKEN);
  let users = Storage.get(STORAGE.USERS);
  
  // 兼容老用户
  if(utils.isEmpty(users)){
    user.isUsed = true;
    users = [user];
  }
  users = utils.map(users, (_user) => {
    _user.isUsed = utils.isEqual(_user.id, user.id);
    return _user;
  });
  state.accounts = users;
}

watch(() => props.isShow, () => {
  if(props.isShow){
    getAccounts();
  }
})

</script>
<template>
  <div class="modal tyn-modal tyn-user-modal tyn-user-acount-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h5 class="pb-2">账号设置</h5>
          <ul class="jg-ul jg-acount-ul">
            <li class="jg-li jg-acount-li" @click="onShowLogin(true)">
              <div class="jg-account">
                <div class="tyn-media tyn-size-rg wr wr-user-st jg-acount-avatar"></div>
                <div class="jg-account-name jg-account-add">添加账号</div>
              </div>
              <div class="jg-account-status wr wr-plus"></div>
            </li>
            <li class="jg-li jg-acount-li" v-for="(account, index) in state.accounts" @click="onSelected(account, index)" :class="{'jg-account-status-selected': account.isUsed}">
              <div class="jg-account">
                <div class="tyn-media tyn-size-rg jg-avatar" :style="{'background-image': 'url(' + account.portrait +')'}"></div>
                <div class="jg-account-name">{{ account.name }}</div>
              </div>
              <div class="jg-account-remove" v-if="!account.isUsed" @click.prevent="onRemove(index)">删除</div>
            </li>
          </ul>
        </div>
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{'show': props.isShow}"></div>  
    <UserLoginModal :is-show="state.isShowLogin" @oncancel="onShowLogin(false)"></UserLoginModal>
  </div>
</template>
