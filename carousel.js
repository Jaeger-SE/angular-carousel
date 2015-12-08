(function() {
    "use strict";

    /**
     * Carousel controller defintion
     */
    function carouselController($interval) {
        var vm = this;

        ///////////////////////////////////

        vm.activeIndex = 0;
        vm.interval = undefined;

        ///////////////////////////////////

        function getZIndex(index) {
            if (index === 0) {
                // first
                if (vm.activeIndex === vm.carouselItems.length - 1) {
                    return 0;
                }
            }
            if (index === vm.carouselItems.length - 1) {
                // last
                if (vm.activeIndex === 0) {
                    return vm.carouselItems.length;
                }
            }
            return vm.carouselItems.length - index;
        }

        function getStyle(item, index) {
            var percentage = 0;
            if (vm.carouselItems.length > 1) {
                if (vm.activeIndex === 0 && index === vm.carouselItems.length - 1) {
                    percentage = -100;
                } else {
                    if (vm.activeIndex === vm.carouselItems.length - 1 && index === 0) {
                        percentage = 100;
                    } else {
                        if (vm.activeIndex > index) {
                            percentage = - 100;
                        } else {
                            if (vm.activeIndex < index) {
                                percentage = 100;
                            }
                        }
                    }
                }
            }
            return {
                'background-image': "url(" + item.ImageUrl + ")",
                'transform': "translateX(" + percentage + "%)",
                'z-index': getZIndex(index)
            };
        }

        function pause() {
            $interval.cancel(vm.interval);
        }

        function restart() {
            vm.interval = $interval(function() {
                if (vm.activeIndex === vm.carouselItems.length - 1) {
                    vm.activeIndex = 0;
                } else {
                    vm.activeIndex++;
                }
            }, vm.carouselDuration * 1000);
        }

        ///////////////////////////////////

        vm.getStyle = getStyle;
        vm.pause = pause;
        vm.restart = restart;

        //////////////////////////////////

        vm.restart();
    }

    carouselController.$inject = ["$interval"];

    /**    
    * Directive definition
     */
    function carouselDirective() {
        return {
            restrict: "EA",
            scope: {
                carouselItemClassName: "@?",
                carouselDuration: "@?"
            },
            replace: true,
            transclude: true,
            bindToController: true,
            controller: carouselController,
            controllerAs: "carousel",
            compile: function(element, attr, linker) {
                if (!attr.carouselItemClassName) {
                    attr.$set("carouselItemClassName", "carousel-item");
                }
                if (!attr.carouselDuration) {
                    attr.$set("carouselDuration", "10");
                }
                return function($scope, $element, $attr) {
                    var myLoop = $attr.carousel,
                        match = myLoop.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),
                        indexString = match[1],
                        collectionString = match[2],
                        elements = [];

                    var container = "<div style=\"overflow:hidden;position:relative;height:100%;;overflow:hidden;position:relative;height:100%;\">" +
                        "<ul style=\"height: 100%;list-style: none;margin: 0;padding: 0;\">" +
                        //"<li style=\"position: absolute; width: 100%; height: 100%; display: block; transition: opacity 0.7s ease-in, transform 1s linear; background-size: cover; background-position: 50% 0%;\" data-ng-mouseenter=\"carousel.pause()\" data-ng-mouseleave=\"carousel.restart()\" data-ng-class=\"{'active': $index==caroussel.activeIndex}\">       </li>" +
                        "</ul>" +
                        "</div>";
                    $element.append(container);

                    var parent = $element.find('ul');

                    $scope.$parent.$watchCollection(collectionString, function (collection) {

                        for (var i = 0; i < collection.length; i++) {
                            var childScope = $scope.$new();

                            childScope[indexString] = collection[i];

                            linker(childScope, function (clone) {

                                var listItem = "<li style=\"position: absolute; width: 100%; height: 100%; display: block; transition: opacity 0.7s ease-in, transform 1s linear; background-size: cover; background-position: 50% 0%;\" data-ng-mouseenter=\"carousel.pause()\" data-ng-mouseleave=\"carousel.restart()\" data-ng-class=\"{'active': $index==caroussel.activeIndex}\">"+clone+"</li>";
                                // clone the transcluded element, passing in the new scope.
                                parent.append(clone); // add to DOM
                                var block = {};
                                block.el = listItem;
                                block.scope = childScope;
                                elements.push(block);
                            });
                        }

                        //var i, block, childScope;
                        // for (i = 0; i < collection.length; i++) {
                        //         // create a new scope for every element in the collection.
                        //         childScope = $scope.$new();

                        //         // pass the current element of the collection into that scope
                        //         childScope[indexString] = collection[i];
                        //         linker(childScope, function(clone) {
                        //             // clone the transcluded element, passing in the new scope.
                        //             parent.append(clone); // add to DOM
                        //             block = {};
                        //             block.el = clone;
                        //             block.scope = childScope;
                        //             elements.push(block);
                        //         });
                        //     };
                    });
                };
            }
        };
    };

    carouselDirective.$inject = [];

    /*
     * Module definition
     */
    var module;

    try {
        module = angular.module("kass-ui");
    } catch (err) {
        module = angular.module("kass-ui", []);
    }

    module.directive("carousel", carouselDirective);
})();