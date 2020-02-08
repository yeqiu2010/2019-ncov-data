import Vue from 'vue';
import Router from 'vue-router';
import home from '@/page/home/home';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: 'home'
    },
    {
      path: '/home',
      name: '主页',
      component: home
    }
  ]
});
