import { createVNode, render } from "vue";
import Toast from "./toast.vue";

let clsName = 'jg-toast';
const $toast = function(options) {
  let container = document.querySelector(`.${clsName}`);
  let vm = createVNode(Toast, options);
  render(vm, container);
  setTimeout(() => {
    container.style = 'top: 5%';
  }, 200)
  setTimeout(() => {
    container.style = "top: -100%;"
  }, options.duration || 3000)
};

export default {
  install(app) {
    let container = document.createElement("div");
    container.className = clsName;
    document.body.appendChild(container);
    app.config.globalProperties.$toast = $toast;
  }
};
