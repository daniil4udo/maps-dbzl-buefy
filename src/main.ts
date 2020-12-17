import VueCompositionApi from '@vue/composition-api'; // <-- Make the import
import Vue from 'vue';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
Vue.use(VueCompositionApi); // <-- Tell Vue to use it

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
