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
        vm.carouselItems = [];

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

        function getStyle(index) {
            var item = vm.carouselItems[index];
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
                'background-image': "url(" + item.src + ")",
                'transform': "translateX(" + percentage + "%)",
                'z-index': getZIndex(index)
            };
        }

        function pause() {
            $interval.cancel(vm.interval);
        }

        function restart() {
            if (vm.interval) {
                $interval.cancel(vm.interval);
            }
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

        // vm.restart();
    }

    carouselController.$inject = ["$interval"];

    /**    
    * Directive definition
     */
    function carouselDirective($compile) {
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
                return{
                    pre: function preLink($scope, $element, $attr, $controller) {

                    },
                    post: function postLink($scope, $element, $attr, $controller) {
                        var myLoop = $attr.carousel,
                            match = myLoop.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),
                            indexString = match[1],
                            collectionString = match[2];

                        var container = "<div style=\"overflow:hidden;position:relative;height:100%;\">" +
                            "<ul style=\"height: 100%;list-style: none;margin: 0;padding: 0;\">" +
                            "</ul>" +
                            "</div>";
                        $element.append(container);

                        var parent = $element.find('ul');

                        $scope.$parent.$watchCollection(collectionString, function (collection) {

                            for (var i = 0; i < collection.length; i++) {
                                var childScope = $scope.$new();

                                childScope[indexString] = collection[i];

                                linker(childScope, function (clone) {

                                    var listItem = "<li " +
                                                   "style=\"position: absolute; width: 100%; height: 100%; display: block; transition: opacity 0.7s ease-in, transform 1s linear; background-size: cover; background-position: 50% 0%;\" " +
                                                   "data-ng-mouseenter=\"carousel.pause()\" " +
                                                   "data-ng-mouseleave=\"carousel.restart()\" " +
                                                   "data-ng-style=\"carousel.getStyle("+i+")\" " +
                                                   "class=\""+$attr.carouselItemClassName+"\"" +
                                                   "data-ng-class=\"{'active': $index==carousel.activeIndex}\">" +
                                                   "</li>";

                                    // clone the transcluded element, passing in the new scope.
                                    parent.append(listItem); // add to DOM
                                    
                                    var liElements = parent.find('li');
                                    var liElement = angular.element(liElements[liElements.length - 1]);
                                    liElement.append(clone);

                                    $compile(liElement)(childScope);

                                    var block = {};
                                    block.el = listItem;
                                    block.scope = childScope;
                                    $controller.carouselItems.push(collection[i]);
                                });
                            }
                            $controller.restart();
                        });
                    }
                };
            }
        };
    }

    carouselDirective.$inject = ["$compile"];

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