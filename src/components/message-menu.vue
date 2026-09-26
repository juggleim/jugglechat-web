<script setup>
import { reactive, watch } from "vue";
import im from "../common/im";
import utils from "../common/utils";
import common from "../common/common";
import { EVENT_NAME } from "../common/enum";
import emitter from "../common/emmit";

const props = defineProps(['isShow', 'message']);
const emit = defineEmits(["onrecall", "onmodify", "ontransfer", "onreply", "onhide", "onremove", "oncopy", "onpinned", "onfav", "onaireply"]);

let juggle = im.getCurrent();
let { MessageType } = juggle;

let state = reactive({
  isTop: true,
  i18n: common.i18n()
});

emitter.$on(EVENT_NAME.ON_APP_LANGUAGE_CHANGED, () => {
  utils.extend(state, {
    i18n: common.i18n()
  })
});

watch(() => props.isShow, (value) => {
  let isTop = true;
  if(value){
    isTop = common.isElementTop(props.message);
  }
  utils.extend(state, { isTop });
})
</script>
<template>
  <div class="dropdown-menu dropdown-menu-xxs fadein-o4" :class="{ 'show': props.isShow, 'dropdown-menu-xxs-bottom': !state.isTop }">
    <ul class="tyn-list-links">
      <li class="tyn-list-link">
        <a href="#" class="wr wr-gpt" @click.stop="emit('onaireply')" v-if="utils.isEqual(props.message.name, MessageType.TEXT)">
          <span>{{ state.i18n.MESSAGE_CTX.AI }}</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-copy" @click.stop="emit('oncopy')" v-if="utils.isEqual(props.message.name, MessageType.TEXT)">
          <span>{{ state.i18n.MESSAGE_CTX.COPY }}</span>
        </a>
      </li>
      <li class="tyn-list-link" v-if="utils.isEqual(props.message.name, MessageType.TEXT)">
        <div class="jg-bottom-line"></div>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-recall" @click.stop="emit('onrecall')" v-if="props.message.isSender">
          <span>{{ state.i18n.MESSAGE_CTX.RECALL }}</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-top" @click.stop="emit('onpinned')">
          <span>{{ state.i18n.MESSAGE_CTX.PIN }}</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-share" @click.stop="emit('ontransfer')">
          <span>{{ state.i18n.MESSAGE_CTX.FORWARD }}</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-message-square" @click.stop="emit('onreply')">
          <span>{{ state.i18n.MESSAGE_CTX.REPLY }}</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <div class="jg-bottom-line"></div>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-fav" @click.stop="emit('onfav')">
          <span>{{ state.i18n.MESSAGE_CTX.FAV }}</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <div class="jg-bottom-line"></div>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-modify" @click.stop="emit('onmodify')" v-if="props.message.isSender && utils.isEqual(props.message.name, MessageType.TEXT)">
          <span>{{ state.i18n.MESSAGE_CTX.EDIT }}</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-delete" @click.stop="emit('onremove')">
          <span>{{ state.i18n.MESSAGE_CTX.DELETE }}</span>
        </a>
      </li>
    </ul>
    <div class="fade-bg" v-if="!state.isShow" @click.stop="emit('onhide')"></div>
  </div>
</template>
