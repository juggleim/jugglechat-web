<script setup>
import im from "../common/im";
import { reactive, getCurrentInstance, watch } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import { STORAGE, RESPONSE, EVENT_NAME }  from "../common/enum";
import { User } from "../services/index";
import emitter from "../common/emmit";
import Storage from "../common/storage";
import LoginBody from "../components/login-body.vue";

const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel"]);
const context = getCurrentInstance();

let state = reactive({});

function onCancel(){
  emit('oncancel', {});
}

watch(() => props.isShow, () => {
  if(props.isShow){
  }
})

</script>
<template>
  <div class="modal tyn-modal tyn-account-login-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h5 class="pb-2">添加账号</h5>
          <LoginBody :is-login="false"></LoginBody>
        </div>
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{'show': props.isShow}"></div>  
  </div>
</template>
