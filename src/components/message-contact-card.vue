<script setup>
import messageUtils from "./message-utils";
import AsiderContactDetail from "./aside-contact-detail.vue";
import { reactive, getCurrentInstance, watch } from "vue";
import { User } from "../services/index";
import utils from "../common/utils";
import { RESPONSE, FRIEND_APPLY_STATUS, CONTACT_TYPE } from "../common/enum";

const context = getCurrentInstance();
const props = defineProps(['message']);
let state = reactive({
  isShowDetail: false,
  current: {}
});

function onShow(){
  let { content: user } = props.message;
  let { user_id } = user;
  User.get({ id: user_id },(result) =>{
    let { code, data } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: `查看名片异常 ${code}`,
        icon: 'error'
      });
    }
    console.log(data)
    let friend = {
      user: data,
      name: data.nickname,
      id: data.user_id,
      avatar: data.avatar,
      status: data.is_friend ? FRIEND_APPLY_STATUS.ACCEPTED : FRIEND_APPLY_STATUS.APPLYING,
      isOneSelf: false,
      type: data.is_friend ? CONTACT_TYPE.FRIEND : CONTACT_TYPE.NEW_FRIEND,
    };
    state.current = friend;
    onShowDetail(true);
  });
  
}
function onShowDetail(isShow){
  state.isShowDetail = isShow;
}
</script>

<template>
  <div class="tyn-reply-avatar">
    <div class="tyn-media tyn-size-md">
      <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.sender.portrait + ')' }"></div>
    </div>
  </div>
  <div class="tyn-reply-group">
    <span class="jg-sender-name" v-if="messageUtils.isGroup(props.message)">{{ props.message.sender.name }}</span>
    <div class="tyn-reply-bubble">
      <div class="tyn-reply-text">
        <div class="jg-contact-card" @click.stop="onShow()">
          <div class="jg-contact-info">
            <div class="tyn-media tyn-size-md">
              <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.content.portrait + ')' }"></div>
            </div>
            <div class="jg-contact-card-title jg-ellipsis">{{ props.message.content.name }}</div>
          </div>
          <div class="jg-contact-memo">[个人名片]</div>
        </div>
      </div>
    </div>
  </div>
  <AsiderContactDetail :is-show="state.isShowDetail" :is-new="1" :current="state.current" @oncancel="onShowDetail(false)"></AsiderContactDetail>
</template>
