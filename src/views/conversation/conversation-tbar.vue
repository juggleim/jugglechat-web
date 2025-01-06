<script setup>
import { reactive, getCurrentInstance, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { ASIDE_MENU_TYPE } from "../../common/enum";
import utils from "../../common/utils";

const router = useRouter();
const props = defineProps(["isShow"]);
let { currentRoute: { _value: { name } } } = router;

let state = reactive({
  tbars: [
    { name: 'ConversationList', title: '消息', icon: 'message', type: ASIDE_MENU_TYPE.MESSAGE, isActive: utils.isEqual(name, 'ConversationList'),  },
    { name: 'Contacts', title: '通讯录', icon: 'contact', type: ASIDE_MENU_TYPE.CONTACT, isActive: utils.isEqual(name, 'Contacts') },
    { name: 'Setting', title: '我的', icon: 'user', type: ASIDE_MENU_TYPE.SETTING, isActive: utils.isEqual(name, 'Setting') },
  ]
});

function onClick(item){
  utils.forEach(state.tbars, (tbar) => {
    tbar.isActive = utils.isEqual(tbar.type, item.type);
  });
  router.push({ name: item.name });
}
</script>

<template>
  <ul class="jg-h5footer">
    <li class="jg-h5footer-item" v-for="tbar in state.tbars" :class="{'jg-h5footer-active': tbar.isActive}" @click="onClick(tbar)">
      <div class="icon wr" :class="['wr-' + tbar.icon]"></div>
      <div class="name">{{ tbar.title }}</div>
    </li>
  </ul>
</template>
