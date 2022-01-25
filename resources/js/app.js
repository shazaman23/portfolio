/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue').default;

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// const files = require.context('./', true, /\.vue$/i)
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

// Vue.component('example-component', require('./components/ExampleComponent.vue').default);

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const app = new Vue({
  el: '#app',
  data: {
    allBgs: ['benegov-site.png', 'uk2-bulk-search.png', 'uk2-disclaimers.png', 'uk2-dont-forget.png', 'uk2-dropdown.png'],
    bgCount: 5,
    currentBg: 0,
    monitorMarginBottom: 0,
    screenDim: { width: 632, height: 422 },
    screenPath: '/img/screenshots/benegov-site.png',
    stripActive: [false, false, false, false, false],
    timeout: false,
    timer: '',
  },
  created() {
    this.timer = setInterval(this.updateScreenBg, 5000);
    setTimeout(this.triggerTimeout, 5000);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  methods: {
    handleResize() {
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
    restartScreenUpdate() {
      clearInterval(this.timer);
      this.timer = setInterval(this.updateScreenBg, 5000);
    },
    setScreenBg(element) {
      this.screenPath = `/img/screenshots/${element}`;
      clearInterval(this.timer);
      this.timer = setInterval(this.restartScreenUpdate, 10000);
    },
    triggerTimeout() {
      this.timeout = true;
    },
    toggleIsOpen(i) {
      const status = this.stripActive.slice(i, i + 1).pop();
      this.stripActive = this.stripActive.map((val, index) => {
        if (!status && i === index) {
          return true;
        }
        return false;
      });
    },
    updateScreenBg() {
      this.screenPath = `/img/screenshots/${this.allBgs[this.currentBg]}`;
      this.currentBg += 1;
      if (this.currentBg >= this.bgCount) {
        this.currentBg = 0;
      }
    },
  },
});
