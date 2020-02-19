import Vue from 'vue';
import Router from 'vue-router';
import home from '@/page/home/home';
import test from '@/page/test';

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
    },
    {
      path: '/test',
      name: '测试',
      component: test
    }
  ]
});
