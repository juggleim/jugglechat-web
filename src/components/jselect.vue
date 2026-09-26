<script setup>
import { reactive, watch } from "vue";
import utils from "../common/utils";
const props = defineProps(['uid', 'current', 'list']);
const emit = defineEmits(["onchanged"]);

let state = reactive({
  current: props.current
});
function onChanged(){
  emit('onchanged', { value: state.current, uid: props.uid })
}
watch(() => props.current, () => {
  state.current = props.current;
})
</script>
<template>
  <div>
    <select v-model="state.current" class="jg-select" @change="onChanged">
      <option :value="item.value" v-for="item in props.list">{{ item.name }}</option>
    </select>
  </div>
</template>