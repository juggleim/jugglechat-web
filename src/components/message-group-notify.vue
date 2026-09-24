<script setup>
import { reactive } from "vue";
import utils from "../common/utils";
import { GROUP_CHANGE_TYPE, STORAGE } from "../common/enum";
import Storage from "../common/storage";
import common from "../common/common";

const props = defineProps(['message']);
let state = reactive({
  i18n: common.i18n(),
  tip: ''
});
let { message } = props;
let { content, sender, isSender } = message;
let { type, members, name: groupName, operator } = content;

let tip = '';
let { i18n } = state;
members = members || [];
let memberNames = utils.map(members, (member) => {
  return member.nickname;
}).join('、');

let owner = sender.name;
if(isSender){
  owner = i18n.COMMON.YOU;
}
if(utils.isEqual(type, GROUP_CHANGE_TYPE.ADD_MEMBER)){
  tip = utils.templateFormat(i18n.GROUP_NOTIFY.INVITE, {
    name: owner,
    member: memberNames,
  });
}else if(utils.isEqual(type, GROUP_CHANGE_TYPE.REMOVE_MEMBER)){
  let isLeave = utils.isHighInclude(members, (member) => {
    return utils.isEqual(member.user_id, operator.user_id);
  });
  if(isLeave){
    tip = utils.templateFormat(i18n.GROUP_NOTIFY.LEAVE, {
      name: owner,
    });
  }else{
    tip = utils.templateFormat(i18n.GROUP_NOTIFY.REMOVE, {
      name: owner,
      member: memberNames,
    });
  }
}else if(utils.isEqual(type, GROUP_CHANGE_TYPE.TRANSFER_OWNER)){
  owner = members[0].nickname;
  tip = utils.templateFormat(i18n.GROUP_NOTIFY.TRAN_OWNER, {
    name: owner,
  });
}else{
  tip = utils.templateFormat(i18n.GROUP_NOTIFY.RENAME, {
    name: owner,
    groupName: groupName
  });
}
state.tip = tip;
</script>

<template>
  <div class="tyn-reply-separator">
    <span class="tyn-separator-item">
      {{ state.tip }}
    </span>
  </div>
</template>
