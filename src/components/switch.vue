<script setup>
import { reactive, watch } from "vue";
import utils from "../common/utils";
const props = defineProps(['isChecked', 'uid']);
const emit = defineEmits(["onchanged"]);
let state = reactive({});

function onChanged(e){
  let isOpen = e.target.checked
  emit('onchanged', { uid: props.uid, isOpen })
}

</script>
<template>
  <label class="jg-switch">
    <input type="checkbox" :checked="props.isChecked" @change="onChanged">
    <span class="jg-switch-slider"></span>
  </label>
</template>