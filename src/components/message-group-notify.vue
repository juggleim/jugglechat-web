<script setup>
import { reactive } from "vue";
import utils from "../common/utils";
import { GROUP_CHANGE_TYPE } from "../common/enum";
const props = defineProps(['message']);
let { content: { type, members }, isSender, sender } = props.message;
let name = isSender ? '你' : sender.name;
let users = utils.map(members, (member) => {
  return member.nickname;
}).join('、');
let tip = `邀请 ${users} 加入群聊`;
if(utils.isEqual(type, GROUP_CHANGE_TYPE.REMOVE_MEMBER)){
  tip = `将 ${users} 移除了群聊`;
}
let label = `${name} ${tip}`;
let state = reactive({
  label: label
});
</script>

<template>
  <div class="tyn-reply-separator">
    <span class="tyn-separator-item" v-if="utils.isEqual(props.message.content.type, GROUP_CHANGE_TYPE.ADD_MEMBER)">
      {{props.message.isSender ? '你' : props.message.sender.name}} 邀请 {{ props.message.content.members.map((member) => { return member.nickname }).join('、') }} 加入群聊
    </span>
    <span class="tyn-separator-item" v-else-if="utils.isEqual(props.message.content.type, GROUP_CHANGE_TYPE.REMOVE_MEMBER)">
      {{props.message.isSender ? '你' : props.message.sender.name}} 将 {{ props.message.content.members.map((member) => { return member.nickname }).join('、') }} 移除群聊
    </span>
    <span class="tyn-separator-item" v-else>
      {{props.message.isSender ? '你' : props.message.sender.name}} 修改群名称为 “{{ props.message.content.name }}”
    </span>
  </div>
</template>
