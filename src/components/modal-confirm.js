import { createVNode, render,  h } from "vue";
import Modal from "./modal-confirm.vue";

let clsName = 'jg-modal-confirm';
let $showModal = function(options) {
  let container = document.createElement("div");
  document.body.appendChild(container);

  let { title, content, icon, onCancel, onConfirm } = options;
  let vm = h(Modal, { 
    title, 
    content, 
    icon,
    onCancel: () => {
      document.body.removeChild(container);  
      onCancel();
    },
    onConfirm: () => {
      document.body.removeChild(container);  
      onConfirm();
    }
  });
  render(vm, container);
};
let $hideModal = function(){
  let container = document.querySelector(`.${clsName}`);
  if(container){
    document.body.removeChild(container);
  }
}
export default {
  install(app) {
    app.config.globalProperties.$showModal = $showModal;
  }
};
