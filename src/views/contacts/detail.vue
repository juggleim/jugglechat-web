<script setup>
import utils from "../../common/utils";
import { useRouter } from "vue-router";
import im from "../../common/im";
import { CONTACT_TYPE, FRIEND_APPLY_STATUS, RESPONSE, EVENT_NAME } from "../../common/enum";
import { Friend } from "../../services";
import { reactive, getCurrentInstance } from "vue";
import emitter from "../../common/emmit";
import Avatar from "../../components/avatar.vue";
import common from "../../common/common";

let { ConversationType } = im.getCurrent();
const router = useRouter();
const props = defineProps(["current"]);
const emit = defineEmits(["onadded", "onremoved"]);
const context = getCurrentInstance();

let i18n = common.i18n();

function onConversation(){
  let { type, id, user } = props.current;
  if(utils.isEqual(type, CONTACT_TYPE.NEW_FRIEND)){
    id = user.user_id;
    type = CONTACT_TYPE.FRIEND;
  }
  
  if(utils.isEqual(type, CONTACT_TYPE.BOT)){
    type = CONTACT_TYPE.FRIEND;
  }

  router.replace({ name: 'ConversationList', query: {  type, id } });
}
function onAddFriend(isAgree){
  let user = props.current.user;
  Friend.confirm({ sponsor_id: user.user_id, is_agree: isAgree }).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: utils.templateFormat(i18n.UI.OPERATION_FAILED, { code }),
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: isAgree ? i18n.UI.FRIEND_ADDED : i18n.UI.REQUEST_DECLINED,
      icon: 'success'
    });
    let _friend = {
      id: user.user_id,
      type: ConversationType.PRIVATE, 
      name: user.nickname, 
      avatar: user.avatar
    }
    emitter.$emit(EVENT_NAME.ON_ADDED_FRIEND, _friend);
    emit('onadded', { item: props.current })
  });
}

function onRemoveFriend(){
  let { id } = props.current;
  Friend.remove({ friendId: id }).then(({ code }) => {
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: utils.templateFormat(i18n.UI.DELETE_FRIEND_FAILED, { code }),
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: i18n.UI.FRIEND_DELETED,
      icon: 'success'
    });
    emit('onremoved', { item: props.current })
  });
}
</script>
<template>
  <div class="tyn-main tyn-content-inner">
    <div class="contact-content">
      <div class="tyn-chat-head" v-if="!utils.isEmpty(props.current)">
        <div class="tyn-media-group">
          <Avatar :cls="'jg-size-rg tyn-conver-avatar'" :avatar="utils.isEqual(props.current.type, CONTACT_TYPE.GROUP) ? '' : props.current.avatar" :name="props.current.name || props.current.user.nickname"></Avatar>
          <div class="tyn-media-col" v-if="utils.isEqual(props.current.type, CONTACT_TYPE.NEW_FRIEND)">
            <div class="tyn-media-row">
              <h3 class="name">{{ props.current.user.nickname }}</h3>
            </div>
            <div class="tyn-media-row has-dot-sap">
              <span class="meta">ID: @{{ props.current.user.user_id }}</span>
            </div>
            <div class="tyn-media-row has-dot-sap" v-if="props.current.phone">
              <span class="meta">{{ i18n.UI.PHONE }}: {{ props.current.phone }}</span>
            </div>
          </div>
          <div class="tyn-media-col" v-else>
            <div class="tyn-media-row">
              <h3 class="name">{{ props.current.name }}</h3>
            </div>
            <div class="tyn-media-row has-dot-sap">
              <span class="meta">ID: @{{ props.current.id }}</span>
            </div>
            <div class="tyn-media-row has-dot-sap" v-if="props.current.phone">
              <span class="meta">{{ i18n.UI.PHONE }}: {{ props.current.phone }}</span>
            </div>
          </div>
        </div>
        <div class="tyn-media-group">
          <div class="tyn-media-row">
            <div class="tyn-media-col" v-if="!utils.isEqual(props.current.type, CONTACT_TYPE.NEW_FRIEND) || (utils.isEqual(props.current.type, CONTACT_TYPE.NEW_FRIEND) && utils.isEqual(props.current.status, FRIEND_APPLY_STATUS.ACCEPTED))">
              <div class="wr wr-message btn btn-light tyn-size-md w-100 contact-send-msg" @click="onConversation">{{ i18n.CONTACT.START_CHAT }}</div>
              <div class="wr wr-delete btn btn-light tyn-size-md w-100 jg-warn-bg" @click="onRemoveFriend" v-if="utils.isEqual(props.current.type, ConversationType.PRIVATE)" >{{ i18n.CONTACT.REMOVE_FRIEND }}</div>
            </div>
            <div class="tyn-media-col" v-else-if="!props.current.isOneSelf && utils.isEqual(props.current.status, FRIEND_APPLY_STATUS.APPLYING)">
              <div class="wr wr-message btn btn-light tyn-size-md w-100 contact-send-msg" @click="onAddFriend(true)">{{ i18n.CONTACT.ADD_FRIEND }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
