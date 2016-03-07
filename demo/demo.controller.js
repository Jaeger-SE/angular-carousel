(function() {
    'use strict';

    angular
        .module('demo')
        .controller('DemoController', DemoController);

    function DemoController() {
        var vm = this;

        vm.slides = [
            {
                src: 'http://placehold.it/1140x250?text=May',
                title: 'Slide 1 (0)'
            },
            {
                src: 'http://placehold.it/1140x250?text=The',
                title: 'Slide 2 (1)'
            },
            {
                src: 'http://placehold.it/1140x250?text=Force',
                title: 'Slide 3 (2)'
            },
            {
                src: 'http://placehold.it/1140x250?text=Be',
                title: 'Slide 4 (3)'
            },
            {
                src: 'http://placehold.it/1140x250?text=With',
                title: 'Slide 5 (4)'
            },
            {
                src: 'http://placehold.it/1140x250?text=You',
                title: 'Slide 6 (5)'
            },
            {
                src: 'http://placehold.it/1140x250?text=You',
                title: 'Slide 7 (6)'
            },
            {
                src: 'http://placehold.it/1140x250?text=You',
                title: 'Slide 8 (7)'
            },
            {
                src: 'http://placehold.it/1140x250?text=You',
                title: 'Slide 9 (8)'
            },
            {
                src: 'http://placehold.it/1140x250?text=You',
                title: 'Slide 10 (9)'
            },
            {
                src: 'http://placehold.it/1140x250?text=You',
                title: 'Slide 11 (10)'
            },
            {
                src: 'http://placehold.it/1140x250?text=You',
                title: 'Slide 12 (11)'
            }
        ];
    }
})();