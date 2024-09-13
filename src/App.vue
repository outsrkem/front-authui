<template>
    <LoginIndex />
</template>
  
<script>
import LoginIndex from './views/login/login.vue'
    export default {
        name: 'AppIndex',
        components: {
            LoginIndex
        }
    }
    // const debounce = (fn, delay) => {
    //     let timer = null;
    //     return function() {
    //         let context = this;
    //         let args = arguments;
    //         clearTimeout(timer);
    //         timer = setTimeout(function() {
    //             fn.apply(context, args);
    //         }, delay);
    //     }
    // }
    // const _ResizeObserver = window.ResizeObserver;
    // window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    //     constructor(callback) {
    //         callback = debounce(callback, 16);
    //         super(callback);
    //     }
    // }
</script>
  
<style>
</style>
  