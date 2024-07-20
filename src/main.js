import { createApp } from 'vue'
import App from './App.vue';
import { setupRouter } from './router';

import './assets/css/bundle.css';
import './assets/css/app.css';
import './assets/css/custom.css';
import Toast from './components/toast';
// if(location.search == '?debug'){
//   var vConsole = new window.VConsole();
// }

async function init() {
  const app = createApp(App);
  Toast.install(app);
  await setupRouter(app);
  app.mount('#app');
}
init();
