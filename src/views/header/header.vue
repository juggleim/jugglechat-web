<script setup>
import { useRouter } from "vue-router";
import utils from "../../common/utils";
import { reactive, watch, getCurrentInstance } from "vue";
import { RESPONSE, STORAGE } from "../../common/enum";
import Storage from "../../common/storage";
import { EVENT_NAME } from "../../common/enum";
import emitter from "../../common/emmit";
import im from "../../common/im";
import ModalUser from "../../components/modal-user.vue";
import common from "../../common/common";
import { User } from "../../services/index";

const context = getCurrentInstance();
const router = useRouter();
let {
  currentRoute: {
    _rawValue: { fullPath }
  }
} = router;
emitter.$on(EVENT_NAME.UN_UNATHORIZED, () => {
  Storage.remove(STORAGE.USER_TOKEN);
  let juggle = im.getCurrent();
  juggle.disconnect();
  router.replace({ name: 'Login' });
});
let state = reactive({
  startMenus: [
    {
      label: "消息",
      name: "ConversationList",
      icon: "message",
      url: '/conversation',
      isActive: utils.isInclude(fullPath, "/conversation") || utils.isEqual("/", fullPath)
    },
    {
      label: "联系人",
      name: "Contacts",
      icon: "contact",
      url: "/contacts",
      isActive: utils.isInclude(fullPath, "/contacts")
    }
  ],
  endMenus: [
    // { label: '个人设置', name: 'Setting', icon: 'setting' },
    { label: "退出登录", name: "Login", icon: "logout" }
  ],
  isShowUserDrop: false,
  user: {},
  isShowUserClose: true,
  isShowUser: false
});

let onNavigate = menu => {
  state.startMenus.map(_menu => {
    _menu.isActive = utils.isEqual(menu.name, _menu.name);
    return _menu;
  });
  if (utils.isEqual(menu.name, "Login")) {
    Storage.remove(STORAGE.USER_TOKEN);
    let juggle = im.getCurrent();
    juggle.disconnect();
  }
  router.push({ name: menu.name });
};
let onHome = () => { };

let onShowDropmenu = () => {
  state.isShowUserDrop = true;
};
let onHideDropmenu = () => {
  state.isShowUserDrop = false;
};
let onLogout = () => {
  Storage.remove(STORAGE.USER_TOKEN);
  let juggle = im.getCurrent();
  juggle.disconnect();
  router.push({ name: "Login" });
};
function onShowUserModal(isShow){
  utils.extend(state, { isShowUser: isShow });
}
function onUserCanncel(){
  onShowUserModal(false);
}
let isSaveingUser = false;
function onUserSave(user){
  if(isSaveingUser){
    return;
  }
  isSaveingUser = true;
  User.update(user).then((result) => {
    isSaveingUser = false;
    if(!utils.isEqual(result.code, RESPONSE.SUCCESS)){
      let errorCode = result.code;
      return context.proxy.$toast({
        text: `保存失败：${errorCode}`,
        icon: 'error'
      });
    }
    utils.extend(state.user, user);
    utils.extend(state, { isShowUser: false, isShowUserClose: true });

    Storage.set(STORAGE.USER_TOKEN, state.user);
    emitter.$emit(EVENT_NAME.ON_USER_INFO_UPDATE, { user: state.user })
  });
}

// 强制修改头像
let user = Storage.get(STORAGE.USER_TOKEN);
let portrait = user.portrait || '';
let isShowUser = utils.isBase64(portrait.replace('data:image/jpeg;base64,', ''));
utils.extend(state, { user, isShowUser, isShowUserClose: !isShowUser });

let useRouterCurrent = reactive(router);
watch(useRouterCurrent, (val) => {
  let { currentRoute: { fullPath } } = val;
  let { startMenus } = state;
  state.startMenus = startMenus.map((menu) => {
    menu.isActive = utils.isInclude(fullPath, menu.url);
    return menu;
  });
})
</script>
<template>
  <div class="tyn-appbar">
    <div class="tyn-appbar-wrap">
      <div class="tyn-appbar-logo">
        <div class="tyn-media tyn-size-rg tyn-header-logo" @click.stop="onShowUserModal(true)"
          :style="{ 'background-image': 'url(' + state.user.portrait + ')' }"></div>
      </div>
      <div class="tyn-appbar-content">
        <ul class="tyn-appbar-nav tyn-appbar-nav-start">
          <li class="tyn-appbar-item" v-for="menu in state.startMenus"
            :class="{ 'active current-page': menu.isActive }">
            <a class="tyn-appbar-link wr" @click="onNavigate(menu)" :class="{ ['wr-' + menu.icon]: true }">
              <span class="d-none">{{ menu.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="tyn-appbar-wrap">
      <ul class="tyn-appbar-nav tyn-appbar-nav-start">
        <li class="tyn-appbar-item">
          <a class="tyn-appbar-link wr wr-logout" @click="onLogout()"></a>
        </li>
      </ul>
    </div>
    <ModalUser :is-show="state.isShowUser" :is-show-close="state.isShowUserClose" :user="state.user" @oncancel="onUserCanncel" @onconfirm="onUserSave"></ModalUser>
  </div>
</template>