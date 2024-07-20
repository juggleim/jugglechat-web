<script setup>
const props = defineProps(["isShow"]);
const emit = defineEmits(["onHideSearch"]);

function onHideSearch() {
  emit("onHideSearch");
}
</script>

<template>
  <div class="tyn-chat-search" :class="{'active': props.isShow}">
    <div class="flex-grow-1">
      <div class="form-group">
        <div class="form-control-wrap form-control-plaintext-wrap">
          <div class="form-control-icon start wr wr-search"></div>
          <input
            type="text"
            class="form-control form-control-plaintext"
            id="searchInThisChat"
            placeholder="Search in this chat"
          />
        </div>
      </div>
    </div>
    <div class="d-flex align-items-center gap gap-3">
      <ul class="tyn-list-inline">
        <li>
          <button class="btn btn-icon btn-sm btn-transparent wr wr-up"></button>
        </li>
        <li>
          <button class="btn btn-icon btn-sm btn-transparent wr wr-down"></button>
        </li>
      </ul>
      <ul class="tyn-list-inline">
        <li>
          <button
            class="btn btn-icon btn-md btn-light js-toggle-chat-search wr wr-close"
            @click="onHideSearch()"
          ></button>
        </li>
      </ul>
    </div>
  </div>
</template>
