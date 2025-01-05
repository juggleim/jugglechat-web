<script setup>
import { reactive, getCurrentInstance, nextTick, watch } from "vue";
import { ASIDE_MENU_TYPE } from "../../common/enum";

const props = defineProps(["isShow"]);

let state = reactive({
  tbars: [
    { name: '消息', icon: 'message', type: ASIDE_MENU_TYPE.MESSAGE, isActive: true },
    { name: '通讯录', icon: 'contact', type: ASIDE_MENU_TYPE.CONTACT, isActive: false },
    { name: '我的', icon: 'user', type: ASIDE_MENU_TYPE.SETTING, isActive: false },
  ]
});

</script>

<template>
  <ul class="jg-h5footer">
    <li class="jg-h5footer-item" v-for="tbar in state.tbars" :class="{'jg-h5footer-active': tbar.isActive}">
      <div class="icon wr" :class="['wr-' + tbar.icon]"></div>
      <div class="name">{{ tbar.name }}</div>
    </li>
  </ul>
</template>
