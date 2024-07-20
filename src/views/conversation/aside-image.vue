<script setup>
const props = defineProps(["isShow", "messages"]);
</script>

<template>
  <div class="tab-pane show active">
    <div class="row g-3">
      <div class="col-4" v-for="message in props.messages">
        <a href="#" class="glightbox tyn-thumb" data-gallery="media-photo">
          <img :src="message.content.thumbnail" class="tyn-image" alt />
        </a>
      </div>
      <div class="name tyn-aside-nothing" v-if="props.messages.length == 0">没有更多了</div>
    </div>
  </div>
</template>
