<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";
import Asider from "./aside.vue";
import Avatar from "./avatar.vue";

import AsiderUserUpdate from "./aside-user-update.vue";
import AsiderUserConfig from "./aside-user-config.vue";
import AsiderUserAccount from "./aside-user-account.vue";
import AsiderQrCode from "./aside-qrcode.vue";
import AsideFavoriteMsg from "./aside-msg-favorite.vue";
import AsideUserAgreement from "./aside-user-agreement.vue";
import AsideLanguage from "./aside-language.vue";

import { User } from "../services/index";
import { RESPONSE, STORAGE, ASIDE_MENU_TYPE, EVENT_NAME, USER_AGREEMENT } from "../common/enum";
import Storage from "../common/storage";

const context = getCurrentInstance();
const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel"]);

let user = Storage.get(STORAGE.USER_TOKEN);
let state = reactive({
  user: user,
  cards: common.getSettingCards(),
  isShowUserUpdateAsider: false,
  isShowUserSettingAsider: false,
  isShowAccountAsider: false,
  isShowUserQrcode: false,
  isShowFavoriteMsg: false,
  isShowUserAgreement: false,
  isShowLanguage: false,
  userAgreentUrl: '',
  userAgreentTitle: '',
  i18n: common.i18n()
});

emitter.$on(EVENT_NAME.ON_APP_LANGUAGE_CHANGED, () => {
  utils.extend(state, {
    cards: common.getSettingCards(),
    i18n: common.i18n()
  })
});

function onLogout(){
  emitter.$emit(EVENT_NAME.UN_UNATHORIZED);
}

function onClick(menu){
  let { event } = menu;
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_UPDATE)){
    onShowUserUpdateAsider(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_SETTING)){
    onShowUserSettingAsider(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_ACCOUNT)){
    onShowAccountAsider(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_QRCODE)){
    onShowUserQrCode(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_FAV)){
    onShowFavoriteMsg(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_AGREEMENT)){
    onShowUserAgreement(true, USER_AGREEMENT.USER, state.i18n.USER_SETTING.USER_AGREEMENT);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_PRIVACY)){
    onShowUserAgreement(true, USER_AGREEMENT.PRIVACY, state.i18n.USER_SETTING.USER_PRIVACY);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.LANGUAGE)){
    onShowLanguage(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_LOGOUT)){
    emitter.$emit(EVENT_NAME.UN_UNATHORIZED);
  }
}
function onShowFavoriteMsg(isShow){
  state.isShowFavoriteMsg = isShow;
}
function onShowUserAgreement(isShow, url, title){
  utils.extend(state, { isShowUserAgreement: isShow, userAgreentUrl: url, userAgreentTitle: title });
}
function onShowUserQrCode(isShow){
  state.isShowUserQrcode = isShow;
}
function onShowUserUpdateAsider(isShow){
  state.isShowUserUpdateAsider = isShow;
}
function onShowUserSettingAsider(isShow){
  state.isShowUserSettingAsider = isShow;
}
function onShowAccountAsider(isShow){
  state.isShowAccountAsider = isShow;
}
function onShowLanguage(isShow){
  state.isShowLanguage = isShow;
}
function onCancel() {
  emit('oncancel', {});
}

emitter.$on(EVENT_NAME.ON_USER_INFO_UPDATE, ({ user }) => {
  utils.extend(state.user, { ...user });
});
</script>

<template>
  <Asider :is-show="props.isShow" :title="state.i18n.USER_SETTING.SETTING" @oncancel="onCancel" :cls="'jg-aside-ust-box'">
    <div class="jg-aside-userst-body jg-setting-aside">
      <ul class="jg-cards">
          <li class="jg-card jg-card-userinfo">
            <ul class="jg-ul">
              <li class="jg-li jg-card-li-userinfo">
                <Avatar
                  :cls="'tyn-ss-avatar jg-header-user-avatar'"
                  :avatar="state.user.portrait"
                  :name="state.user.name || state.user.id">
                </Avatar>
                <!-- <div class="tyn-avatar jg-header-user-avatar" :style="{ 'background-image': 'url(' + state.user.portrait + ')' }"></div> -->
                <div class="jg-header-user-name">{{ state.user.name }}</div>
              </li>
              <li class="jg-li">
                <div class="label">{{ state.i18n.USER_SETTING.USER_ID }}</div>
                <div class="value">{{ state.user.id }}</div>
              </li>
            </ul>
          </li>
          <li class="jg-card" v-for="card in state.cards">
            <ul class="jg-ul">
              <li class="jg-li" v-for="menu in card.menus" @click.prevent="onClick(menu)">
                <a class="wr " :class="{ ['wr-' + menu.icon]: true, 'jg-force-warn-letter': menu.isWarn }">{{ menu.name }}</a>
              </li>
            </ul>
          </li>
        </ul>
    </div>
  </Asider>
  <AsiderUserUpdate :is-show="state.isShowUserUpdateAsider" @oncancel="onShowUserUpdateAsider(false)"></AsiderUserUpdate>
  <AsiderUserConfig :is-show="state.isShowUserSettingAsider" @oncancel="onShowUserSettingAsider(false)"></AsiderUserConfig>
  <AsiderUserAccount :is-show="state.isShowAccountAsider" @oncancel="onShowAccountAsider(false)"></AsiderUserAccount>
  <AsideFavoriteMsg :is-show="state.isShowFavoriteMsg" @oncancel="onShowFavoriteMsg(false)"></AsideFavoriteMsg>
  
  <AsideUserAgreement 
    :is-show="state.isShowUserAgreement" 
    :right="0" 
    :url="state.userAgreentUrl" 
    :title="state.userAgreentTitle" 
    @oncancel="onShowUserAgreement(false)"></AsideUserAgreement>

  <AsiderQrCode 
    :is-show="state.isShowUserQrcode"
    :right="0"
    :title="state.i18n.USER_SETTING.QRCODE"
    :desc="state.i18n.USER_SETTING.SCANQR_DESC"
    :isGroup="0"
    :uid="state.user.id"
    @oncancel="onShowUserQrCode(false)">
  </AsiderQrCode>

  <AsideLanguage
    :is-show="state.isShowLanguage"
    :right="0"
    @oncancel="onShowLanguage(false)">
  </AsideLanguage>

</template>
