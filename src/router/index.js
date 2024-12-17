import { createRouter, createWebHistory } from 'vue-router'
import { Layout } from '@/views/layout';
import Common from '@/common/common';
import utils from '@/common/utils';
import { STORAGE } from "../common/enum";
import Storage from "../common/storage";

let routes = [{
  path: '/',
  name: 'Root',
  component: Layout,
  children: [
    {
      path: '/conversation',
      name: 'ConversationList',
      component:  () => import('@/views/conversation/conversation-list.vue'),
    },
    {
      path: '/setting',
      name: 'Settings',
      component:  () => import('@/views/setting/setting.vue'),
    },
    {
      path: '/contacts',
      name: 'Contacts',
      component: () => import('@/views/contacts/contacts.vue'),
    }
  ],
},
{
  path: '/login',
  name: 'Login',
  component: () => import('@/views/login/login.vue'),
},
// {
//   path: '/register',
//   name: 'Register',
//   component: () => import('@/views/register/register.vue'),
// },
// {
//   path: '/forgot',
//   name: 'Forgot',
//   component: () => import('@/views/forget/forget.vue'),
// },
{
  path: '/404',
  name: '404',
  component: () => import('@/views/error/404.vue'),
},
{
  path: '/:pathMatch(.*)*',
  name: 'notFound',
  redirect: '/404',
}];

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})
router.beforeEach((to, from, next)=> {
  let user = Storage.get(STORAGE.USER_TOKEN);
  if(utils.isEqual(to.name, 'Root')){
    return router.push({ name: 'ConversationList' })
  }
  if (user.id || utils.isEqual(to.name, 'Login')) {
    next();
  }else{
    next({ name: 'Login'})
  }
})
export async function setupRouter(app) {
  app.use(router);
  await router.isReady();
}
