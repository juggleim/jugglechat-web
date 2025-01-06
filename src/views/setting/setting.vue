<script setup>
import utils from "../../common/utils";
import { useRouter } from "vue-router";
import { reactive, getCurrentInstance, watch } from "vue";
import { RESPONSE, EVENT_NAME }  from "../../common/enum";

import H5TBar from "../conversation/conversation-tbar.vue";
import H5Header from "../conversation/conversation-header.vue";

import im from "../../common/im";
import { STORAGE } from "../../common/enum";
import Storage from "../../common/storage";
import common from "../../common/common";
import emitter from "../../common/emmit";

let juggle = im.getCurrent();
let { ConversationType, Event, ConnectionState } = juggle;

const context = getCurrentInstance();
let state = reactive({
  list: []
});

let user = Storage.get(STORAGE.USER_TOKEN);
im.connect(user, {
  success: (_user) => {},
  error: () => {}
});

const router = useRouter();
let useRouterCurrent = reactive(router);
watch(useRouterCurrent, (val) => {
})

function onLogout(){
  emitter.$emit(EVENT_NAME.UN_UNATHORIZED);
}
</script>
<template>
  <div class="tyn-contact tyn-content tyn-content-full-height tyn-chat has-aside-base">
    <div class="tyn-aside tyn-contact-aside">
      <H5Header></H5Header>
      <div class="tyn-aside-body">
        <div class="tab-content">
          <a class="btn btn-primary-soft w-100 warn" @click="onLogout()">退出</a>
        </div>
      </div>
      <H5TBar></H5TBar>
    </div>
    <ContactDetail :current="state.current" @onadded="onAddFriend" @onremoved="onRemoveFriend"></ContactDetail>
  </div>
</template>