<script setup>
import utils from "../../common/utils";
import SettingDetail from "./detail.vue";
import { useRouter } from "vue-router";
import { reactive, getCurrentInstance, watch } from "vue";
import { RESPONSE, EVENT_NAME, SETTING_TYPE }  from "../../common/enum";

import AisdeHeader from "../../components/aside-header.vue";
import AisdeFooter from "../../components/aside-footer.vue";

import im from "../../common/im";
import { STORAGE } from "../../common/enum";
import Storage from "../../common/storage";
import { Friend, Group } from "../../services/index";
import common from "../../common/common";
import emitter from "../../common/emmit";

let router = useRouter();

let { ConversationType } = im.getCurrent();
let menus = [
  { uid: SETTING_TYPE.USER, name: '用户设置', icon: 'wr-operate', isSelected: true },
  // { uid: SETTING_TYPE.PUSH, name: '推送设置', icon: 'wr-message-square', isSelected: false },
];
const context = getCurrentInstance();
let state = reactive({
  menus: menus,
  currentType: SETTING_TYPE.USER,
});

function onShowProfile(item){
  state.menus.map((_item) => {
    _item.isSelected = utils.isEqual(item.uid, _item.uid);
    return _item;
  });
  state.currentType = item.uid;
}

</script>
<template>
  <div class="tyn-contact tyn-content tyn-content-full-height tyn-chat has-aside-base">
    <div class="tyn-aside tyn-contact-aside">
      <AisdeHeader :title="'设置'"></AisdeHeader>
      <div class="tyn-aside-body" data-simplebar>
        <div class="tab-content">
          <div class="tab-pane show active">
            <ul class="tyn-aside-list jg-user-settings">
              <li class="tyn-aside-item js-toggle-main" 
                v-for="item in state.menus" 
                :class="{'active': item.isSelected}" 
                @click="onShowProfile(item)">
                <div class="tyn-media-group jg-user-setting-item">
                  <div class="icon wr" :class="[item.icon]"></div>
                  <div class="name">{{ item.name }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <AisdeFooter></AisdeFooter>
    </div>
    <SettingDetail :type="state.currentType"></SettingDetail>
  </div>
</template>