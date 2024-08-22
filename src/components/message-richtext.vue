<script setup>
const props = defineProps(["message"]);
</script>

<template>
    <div class="tyn-reply-avatar" v-if="!props.message.isSender">
      <div class="tyn-media tyn-size-md">
        <img src="../assets/images/avatar/2.jpg" alt />
      </div>
    </div>
    <div class="tyn-reply-group">
      <div class="tyn-reply-bubble">
        <div class="tyn-reply-link has-thumb">
          <div class="tyn-reply-link-thumb">
            <a href="#">
              <h6 class="tyn-reply-link-title">Digital Marketing Guide line for dummies</h6>
              <img src="../assets/images/avatar/4.jpg" alt />
            </a>
          </div>
          <a
            class="tyn-reply-anchor"
            href="https://www.envato.com/atomic-power-plant-engine/"
          >https://www.envato.com/atomic-power-plant-engine/</a>
        </div>
        <ul class="tyn-reply-tools">
          <li>
            <button class="btn btn-icon btn-sm btn-transparent btn-pill wr wr-smile"></button>
          </li>
          <!-- li -->
          <li class="dropup-center">
            <button class="btn btn-icon btn-sm btn-transparent btn-pill wr wr-more" data-bs-toggle="dropdown"></button>
            <div class="dropdown-menu dropdown-menu-xxs">
              <ul class="tyn-list-links">
                <li>
                  <a href="#" class="wr wr-modify">
                    <span>Edit</span>
                  </a>
                </li>
                <li>
                  <a href="#" class="wr wr-delete">
                    <span>Delete</span>
                  </a>
                </li>
              </ul>
              <!-- .tyn-list-links -->
            </div>
            <!-- .dropdown-menu -->
          </li>
          <!-- li -->
        </ul>
        <!-- .tyn-reply-tools -->
      </div>
    </div>
</template>
