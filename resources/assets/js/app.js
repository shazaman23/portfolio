
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue');

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

Vue.component('example-component', require('./components/ExampleComponent.vue'));

const app = new Vue({
    el: '#app',
    data: {
      screenPath: '/img/screenshots/benegov-site.png',
      bgCount: 5,
      currentBg: 0,
      allBgs: ['benegov-site.png', 'uk2-bulk-search.png', 'uk2-disclaimers.png', 'uk2-dont-forget.png', 'uk2-dropdown.png'],
      stripActive: [false, false, false, false, false],
      timer: '',
      timeout: false
    },
    created: function() {
      this.timer = setInterval(this.updateScreenBg, 5000);
      setTimeout(this.triggerTimeout, 5000);
    },
    methods: {
      setScreenBg: function(element) {
        this.screenPath = '/img/screenshots/' + element;
        clearInterval(this.timer);
        this.timer = setInterval(this.restartScreenUpdate, 10000);
      },
      updateScreenBg: function() {
        this.screenPath = '/img/screenshots/' + this.allBgs[this.currentBg];
        this.currentBg++;
        if (this.currentBg >= this.bgCount) {
          this.currentBg = 0;
        }
      },
      restartScreenUpdate: function() {
        clearInterval(this.timer);
        this.timer = setInterval(this.updateScreenBg, 5000);
      },
      triggerTimeout: function() {
        this.timeout = true;
      },
      toggleIsOpen: function(i) {
        console.log("First: " + this.stripActive[i]);
        this.stripActive[i] = !this.stripActive[i];
        console.log("Last: " + this.stripActive[i]);
      }
    }
});
