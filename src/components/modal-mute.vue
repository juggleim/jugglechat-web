<script setup>
import im from "../common/im";
import { reactive, watch } from "vue";
import utils from "../common/utils";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let juggle = im.getCurrent();
let { ConversationType } = juggle;
let state = reactive({
  list: utils.clone([
    { time: 1, start: '8:00', end: '12:00', checked: true },
    { time: 2, start: '12:00', end: '18:00', checked: false },
    { time: 3, start: '18:00', end: '24:00', checked: false },
    { time: 4, start: '24:00', end: '8:00', checked: false },
    { time: 5, start: '00:00', end: '24:00', checked: false },
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

</script>
<template>
  <div class="modal tyn-modal jg-conver-mute-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h4 class="pb-2">消息免打扰时段</h4>
          <ul class="tyn-media-list gap gap-2">
            <li v-for="item in state.list" @click="onSelected(item)">
              <div class="form-check form-check-algin">
                <span class="wr wr-circle"
                  :class="[item.checked ? 'wr-success' : '']"></span>
                <div class="form-check-label">
                {{ item.start }} ~ {{ item.end }} 
                </div>
              </div>
            </li>
          </ul>
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-md btn-success" @click="onConfirm()">确认</button>
            </li>
            <li>
              <button class="btn btn-md btn-light" @click="onCancel()">取消</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
