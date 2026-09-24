<script setup>
import common from "../../common/common";
const props = defineProps(["isShow", "messages"]);
let i18n = common.i18n();
</script>

<template>
  <div class="tab-pane show active">
    <div class="row g-3">
      <div class="col-4" v-for="message in props.messages">
        <a href="#" class="glightbox tyn-thumb" data-gallery="media-photo">
          <img :src="message.content.thumbnail" class="tyn-image" alt />
        </a>
      </div>
      <div class="name tyn-aside-nothing" v-if="props.messages.length == 0">{{ i18n.UI.NO_MORE_ITEMS }}</div>
    </div>
  </div>
</template>
