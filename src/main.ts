import VueCompositionApi from '@vue/composition-api'; // <-- Make the import
import Buefy from 'buefy';
import Vue from 'vue';

import App from './App.vue';
import 'buefy/dist/buefy.css';

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.use(VueCompositionApi); // <-- Tell Vue to use it

new Vue({
    render: h => h(App),
}).$mount('#app');
