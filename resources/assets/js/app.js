
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
      allBgs: ['benegov-site.png', 'uk2-bulk-search.png', 'uk2-disclaimers.png', 'uk2-dont-forget.png', 'uk2-dropdown.png'],
      bgCount: 5,
      currentBg: 0,
      monitorMarginBottom: 0,
      screenDim: {'width': 632, 'height': 422},
      screenPath: '/img/screenshots/benegov-site.png',
      stripActive: [false, false, false, false, false],
      timeout: false,
      timer: ''
    },
    created: function() {
      this.timer = setInterval(this.updateScreenBg, 5000);
      setTimeout(this.triggerTimeout, 5000);
      window.addEventListener('resize', this.handleResize);
      this.handleResize("start");
    },
    methods: {
      handleResize: function(event) {
        if (window.innerWidth > 768) {
          this.screenDim.width = 632;
          this.screenDim.height = 422;
          this.monitorMarginBottom = 0;
        } else if (window.innerWidth > 625) {
          this.screenDim.width = window.innerWidth / 1.25;
          this.screenDim.height = this.screenDim.width / 1.48;
        } else if (window.innerWidth > 545) {
          this.screenDim.width = window.innerWidth / 1.28;
          this.screenDim.height = this.screenDim.width / 1.46;
        } else if (window.innerWidth > 450) {
          this.screenDim.width = window.innerWidth / 1.31;
          this.screenDim.height = this.screenDim.width / 1.46;
        } else if (window.innerWidth > 400) {
          this.screenDim.width = window.innerWidth / 1.36;
          this.screenDim.height = this.screenDim.width / 1.45;
        } else if (window.innerWidth > 350) {
          this.screenDim.width = window.innerWidth / 1.40;
          this.screenDim.height = this.screenDim.width / 1.46;
        } else {
          this.screenDim.width = window.innerWidth / 1.46;
          this.screenDim.height = this.screenDim.width / 1.46;
        }
        if (window.innerWidth > 768) {
          this.monitorMarginBottom = 0;
        } else {
          this.monitorMarginBottom = (768 - window.innerWidth) * -1;
        }
      },
      restartScreenUpdate: function() {
        clearInterval(this.timer);
        this.timer = setInterval(this.updateScreenBg, 5000);
      },
      setScreenBg: function(element) {
        this.screenPath = '/img/screenshots/' + element;
        clearInterval(this.timer);
        this.timer = setInterval(this.restartScreenUpdate, 10000);
      },
      triggerTimeout: function() {
        this.timeout = true;
      },
      toggleIsOpen: function(i) {
        var status = this.stripActive.slice(i, i + 1).pop();
        this.stripActive = this.stripActive.map(function(val, index) {
          if (!status && i === index) {
            return true;
          } else {
            return false;
          }
        });
      },
      updateScreenBg: function() {
        this.screenPath = '/img/screenshots/' + this.allBgs[this.currentBg];
        this.currentBg++;
        if (this.currentBg >= this.bgCount) {
          this.currentBg = 0;
        }
      }
    }
});
