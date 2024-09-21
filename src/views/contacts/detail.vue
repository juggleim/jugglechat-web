<script setup>
import utils from "../../common/utils";
import { useRouter } from "vue-router";
import im from "../../common/im";
let { ConversationType } = im.getCurrent();
const router = useRouter();
const props = defineProps(["current"]);

function onConversation(){
  let { type, id } = props.current;
  router.replace({ name: 'ConversationList', query: {  type, id } });
}
</script>
<template>
  <div class="tyn-main tyn-content-inner">
    <div class="contact-content">
      <div class="tyn-chat-head" v-if="!utils.isEmpty(props.current)">
        <div class="tyn-media-group">
          <div class="tyn-media tyn-size-3xl d-none d-sm-inline-flex tyn-conver-avatar" :style="{ 'background-image': 'url('+props.current.avatar+')' }"></div>
          <div class="tyn-media-col">
            <div class="tyn-media-row">
              <h3 class="name">{{ props.current.name }}</h3>
            </div>
            <div class="tyn-media-row has-dot-sap">
              <span class="meta">ID: {{ props.current.id }}</span>
            </div>
            <div class="tyn-media-row has-dot-sap" v-if="props.current.phone">
              <span class="meta">手机号: {{ props.current.phone }}</span>
            </div>
          </div>
        </div>
        <div class="tyn-media-group">
          <div class="tyn-media-row">
            <div class="tyn-media-col">
              <div class="wr wr-message btn btn-light tyn-size-md w-100 contact-send-msg" @click="onConversation">发起会话</div>
            </div>
          </div>
        </div>
        <div class="tyn-media-group">
          <div class="tyn-media-row">
            <div class="tyn-media-col">
              <!-- <div class="wr wr-message btn btn-light tyn-size-md w-100 lower-btn" v-if="utils.isEqual(props.current.type, ConversationType.PRIVATE)" >删除好友</div> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>