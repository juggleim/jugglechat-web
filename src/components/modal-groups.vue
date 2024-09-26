<script setup>
import im from "../common/im";
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import utils from "../common/utils";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let context = getCurrentInstance();

let juggle = im.getCurrent();
let { ConversationType } = juggle;
let state = reactive({
  list: utils.clone([
    { id: 'n1', title: '消息', isInner: true, category: '默认分组' },
    { id: 'n2', title: '单聊', isInner: true, category: '默认分组' },
    { id: 'n3', title: '群聊', isInner: true, category: '默认分组' },
    { id: 'n4', title: '@我', isInner: true, category: '默认分组' },
    { id: 'n5', title: 'JuggleIM', isInner: false, category: '自定义分组' },
  ])
});
let user = Storage.get(STORAGE.USER_TOKEN);

watch(() => props.isShow, () => {

});

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
  state.list.push({ title: `分组-${state.list.length}`, isInner: false, category: '自定义分组' })
  scrollBottom();
}
function onRemove(index){
  let item = state.list[index];
  if(item.isInner){
    return;
  }
  state.list.splice(index, 1);
}
function scrollBottom() {
  nextTick(() => {
    let { groups } = context.refs;
    if (groups) {
      groups.scrollTop = groups.scrollHeight;
    }
  });
}
</script>
<template>
  <div class="modal tyn-modal jg-conver-group-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0">
        <div class="modal-body">
          <div class="jg-modal-header">
            <div class="title">会话分组</div>
            <ul class="jg-conversations-tools">
              <li class="jg-conversation-tool wr wr-cir-add jg-modal-add" @click="onAdd">添加</li>
            </ul>
          </div>
          <ul class="tyn-media-list" ref="groups">
            <li v-for="(item, index) in state.list" class="jg-conver-modal-group">
              <div class="jg-conver-group-name">
                <span class="wr wr-cir-remove jg-text-danger" :class="{'jg-text-disable': item.isInner}" @click="onRemove(index)"></span>
                <input type="text" class="form-control" :disabled="item.isInner" :value="item.title">
              </div>
              <div class="jg-conver-group-desc">默认分组</div>
            </li>
          </ul>
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-sm btn-success" @click="onConfirm()">确认</button>
            </li>
            <li>
              <button class="btn btn-sm btn-light" @click="onCancel()">取消</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
