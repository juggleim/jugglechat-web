<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";

const props = defineProps(["isShow"]);
const emit = defineEmits([]);

const context = getCurrentInstance();

let state = reactive({
  list: []
});

watch(() => props.isShow, () => {
});
</script>

<template>
  <div class="tyn-common-aside" :class="[props.isShow ? 'show-caside' : '']">
  123123
  </div>
</template>
