(function() {
    'use strict';

    angular
        .module('demo')
        .controller('DemoController', DemoController);

    function DemoController() {
        var vm = this;

        vm.slides = [
            {
                src: 'http://lorempixel.com/1200/250/cats',
                title: 'Slide 1'
            },
            {
                src: 'http://lorempixel.com/1200/250/people',
                title: 'Slide 2'
            },
            {
                src: 'http://lorempixel.com/1200/250/food',
                title: 'Slide 3'
            }
        ];
    }
})();