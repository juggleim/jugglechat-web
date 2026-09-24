import { createApp } from 'vue'
import App from './App.vue';
import { setupRouter } from './router';

import './assets/css/markdown.min.css';
import './assets/css/bundle.css';
import './assets/css/app.css';
import './assets/css/custom.css';
import './assets/css/h5.css';
import Toast from './components/toast';
import Modal from './components/modal-confirm';



// if(location.search == '?debug'){
//   var vConsole = new window.VConsole();
// }

let LONG_PRESS_DEFAULT_DELAY = 750;

async function init() {
  const app = createApp(App);
  app.directive("longpress", {
    mounted: (el, binding) => {
      el.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        binding.value(event);
      });
    }
  });
  Toast.install(app);
  Modal.install(app);
  await setupRouter(app);
  app.mount('#app');
}
init();
