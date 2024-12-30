<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { LANGUAGES } from "../common/enum";

const props = defineProps(["title", "current", "isAuto", "name"]);
const emit = defineEmits(['save']);
const context = getCurrentInstance();
let languages = utils.clone(LANGUAGES);
if(!props.isAuto){
  languages.splice(0, 1);
}
let state = reactive({
  languages: languages,
  current: props.current
});

function onChange(){
  let result = {};
  result[props.name] = state.current;
  emit('save', result);
}
</script>

<template>
  <div class="jg-language-box">
    <div class="jg-langugage-title">{{ props.title }}</div>  
    <select class="form-select jg-language-select" v-model="state.current" @change="onChange">
      <option :value="lang.name" v-for="lang in state.languages">{{ lang.title }}</option>
    </select>
  </div>
</template>
