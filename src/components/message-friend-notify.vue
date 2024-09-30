<script setup>
import { reactive } from "vue";
import utils from "../common/utils";
const props = defineProps(['message']);
let { content: { type },isSender, sender } = props.message;
let opName = type == 0 ? '添加' : '删除';
let tip = `${name} ${opName} 你为好友`;
if(isSender){
  tip = `你 ${opName} ${sender.name} 为好友`;
}
let state = reactive({
  label: tip
});
</script>

<template>
  <div class="tyn-reply-separator">
    <span class="tyn-separator-item">
      {{ state.label }}
    </span>
  </div>
</template>
