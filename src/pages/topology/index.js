import Vue from 'vue';
import ElementUI from 'element-ui';
import App from './index.vue';

Vue.use(ElementUI, { size: 'small' });

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
