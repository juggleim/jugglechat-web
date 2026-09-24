<script setup>
import im from "../common/im";
import common from "../common/common";
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import utils from "../common/utils";
import Storage from "../common/storage";
import { STORAGE, EVENT_NAME, CONVERSATION_TAG_TYPE } from "../common/enum";
import emitter from "../common/emmit";

const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let context = getCurrentInstance();
let i18n = common.i18n();

let juggle = im.getCurrent();
let { ConversationType } = juggle;
let state = reactive({
  list: []
});
let user = Storage.get(STORAGE.USER_TOKEN);

function onSelected(item){
  utils.map(state.list, (_item) => {
    _item.checked = false;
    if(utils.isEqual(item.time, _item.time)){
      _item.checked = !item.checked;
    }
  })
}
function onCancel() {
  emit('oncancel', {});
}

function onConfirm() {
  let item = utils.filter(state.list, (item) => {
    return item.checked;
  })[0];
  emit('onconfirm', item);
}

function onAdd(){
  let tag = { id: `T${Date.now()}`, name: '', isInner: false, type: CONVERSATION_TAG_TYPE.CUSTOM }
  state.list.push(tag)
  scrollBottom();
}
function onRemove(index){
  let item = state.list[index];
  if(item.isInner){
    return;
  }
  state.list.splice(index, 1);
  juggle.destroyConversationTag(item);
  emitter.$emit(EVENT_NAME.ON_CONVERSATION_TAG_CHANGED, { isRemove: true, tag: item })
}
function onSave(index){
  let item = state.list[index];
  if(utils.isEqual(item.name.length, 0)){
    return;
  }
  juggle.createConversationTag(item);
  emitter.$emit(EVENT_NAME.ON_CONVERSATION_TAG_CHANGED, { isRemove: false, tag: item })
  context.proxy.$toast({ text: i18n.COMMON.SAVE_SUCCESS, icon: 'success' });

}
function scrollBottom() {
  nextTick(() => {
    let { groups } = context.refs;
    if (groups) {
      groups.scrollTop = groups.scrollHeight;
    }
  });
}

watch(() => props.isShow, async () => {
  if(props.isShow){
    let { tags = [] } = await juggle.getConversationTags();
    state.list = common.formatTags(tags);
  }
})

</script>
<template>
  <div class="modal tyn-modal jg-conver-group-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0">
        <div class="modal-body">
          <div class="jg-modal-header">
            <div class="title">{{ i18n.MAIN.TAG.TITLE }}</div>
            <ul class="jg-conversations-tools">
              <li class="jg-conversation-tool wr wr-cir-add jg-modal-add" @click="onAdd">{{ i18n.MAIN.TAG.ADD }}</li>
            </ul>
          </div>
          <ul class="tyn-media-list" ref="groups">
            <li v-for="(item, index) in state.list" class="jg-conver-modal-group">
              <div class="jg-conver-group-name" :class="{ 'wr-asterisk jg-text-danger': item.name.length == 0 }">
                <span class="wr wr-cir-remove jg-text-danger" :class="{'jg-text-disable': item.isInner}" @click="onRemove(index)"></span>
                <input type="text" class="form-control" :placeholder="i18n.MAIN.TAG.PLACEHOLDER" :disabled="item.isInner" v-model="item.name" @blur="onSave(index)" @keydown.enter="onSave(index)">
              </div>
              <div class="jg-conver-group-desc" :class="{'jg-conver-group-desc-custom': !item.isInner}">{{ item.isInner ? i18n.MAIN.TAG.SYSTEM : i18n.MAIN.TAG.CUSTOM }}</div>
            </li>
          </ul>
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <!-- <li>
              <button class="btn btn-sm btn-success" @click="onConfirm()">{{ i18n.COMMON.CONFIRM_BTN }}</button>
            </li> -->
            <!-- <li>
              <button class="btn btn-sm btn-light" @click="onCancel()">{{ i18n.COMMON.CANCEL_BTN }}</button>
            </li> -->
          </ul>
        </div>
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
