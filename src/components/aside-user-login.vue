<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";
import Asider from "./aside.vue";
import im from "../common/im";
import { User } from "../services/index";
import { RESPONSE, STORAGE, EVENT_NAME } from "../common/enum";
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
  <Asider :is-show="props.isShow" :title="'添加账号'" @oncancel="onCancel">
    <div class="jg-aside-userlogin-body">
      <LoginBody :is-login="false" :is-add="true" :is-show="props.isShow"></LoginBody>
    </div>
  </Asider>
</template>
