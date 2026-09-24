<script setup>
import { reactive, getCurrentInstance, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { ASIDE_MENU_TYPE } from "../../common/enum";
import utils from "../../common/utils";
import common from "../../common/common";

const router = useRouter();
const props = defineProps(["isShow"]);
let { currentRoute: { _value: { name } } } = router;
let i18n = common.i18n();

let state = reactive({
  tbars: [
    { name: 'ConversationList', title: i18n.UI.CHATS, icon: 'hmsg', type: ASIDE_MENU_TYPE.MESSAGE, isActive: utils.isEqual(name, 'ConversationList'),  },
    { name: 'Contacts', title: i18n.UI.CONTACTS, icon: 'hcontact', type: ASIDE_MENU_TYPE.CONTACT, isActive: utils.isEqual(name, 'Contacts') },
    { name: 'Setting', title: i18n.UI.ME, icon: 'hsetting', type: ASIDE_MENU_TYPE.SETTING, isActive: utils.isEqual(name, 'Setting') },
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
  <ul class="jg-h5footer" v-if="utils.isMobile()" :class="{ 'jg-uni-browser': utils.isUniapp() }">
    <li class="jg-h5footer-item" v-for="tbar in state.tbars" :class="{'jg-h5footer-active': tbar.isActive}" @click="onClick(tbar)">
      <div class="icon wr" :class="['wr-' + tbar.icon]"></div>
      <div class="name">{{ tbar.title }}</div>
    </li>
  </ul>
</template>
