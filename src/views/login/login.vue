<script setup>
import { reactive } from "vue";

import WinHeader from '../../components/win-header.vue';
import JFooter from '../../components/footer.vue';
import LoginBody from '../../components/login-body.vue';

import im from "../../common/im";

let juggle = im.getCurrent();
let state = reactive({
});

</script>
<template>
  <WinHeader></WinHeader>
  <LoginBody :is-login="true"></LoginBody>
  <JFooter></JFooter>
</template>