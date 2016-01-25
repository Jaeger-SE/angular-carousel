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
            if (vm.carouselMultiple > 1) {
                return getZIndexForMultiple(index);
            } else {
                return getZIndexForRegular(index);
            }

            function getZIndexForMultiple(index) {
                vm.carouselMultiple = parseInt(vm.carouselMultiple);
                if (index === vm.carouselItems.length - 1) {
                    return 0;
                }
                if (index === (vm.activeIndex - 1) || index === vm.activeIndex) {
                    return 1;
                }
                if (index > vm.activeIndex && index <= (vm.activeIndex + vm.carouselMultiple -1)) {
                    return 1;
                }
                if (vm.activeIndex > vm.carouselItems.length - vm.carouselMultiple) {
                    var calc = (Math.abs(vm.carouselItems.length - (vm.activeIndex + vm.carouselMultiple)) - 1);
                    if (index <= calc) {
                        return 1;
                    }
                }
                return 0;

            }

            function getZIndexForRegular(index) {
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

        }

        function getStyle(index) {
            var item = vm.carouselItems[index];
            var percentage = 0;
            if (vm.carouselItems.length > 1) {
                if (vm.carouselMultiple > 1) {
                    percentage = getStyleForMultiple(index, percentage);
                } else {
                    percentage = getStyleForRegular(index, percentage);
                }
            }

            function getStyleForMultiple(index, percentage) {
                if (vm.activeIndex === 0 && index === vm.carouselItems.length - 1) {
                    percentage = -(vm.carouselItems.length * 100);
                } else {
                    if (vm.activeIndex >= vm.carouselItems.length - vm.carouselMultiple && index < (vm.activeIndex - 1)) {
                        percentage = (vm.carouselItems.length - vm.activeIndex) * 100;
                    } else {
                        percentage = -(vm.activeIndex * 100);
                    }
                }
                return percentage;
            }

            function getStyleForRegular(index, percentage) {
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
                return percentage;
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
                if (vm.activeIndex === vm.carouselItems.length - 1 || vm.activeIndex >= vm.carouselItems.length) {
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
                carouselDuration: "@?",
                carouselMultiple: "@?"
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
                if (!attr.carouselMultiple) {
                    attr.$set("carouselMultiple", "1");
                    attr.carouselMultiple = parseInt(attr.carouselMultiple);
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

                            var width = 100 / $attr.carouselMultiple;
                            
                            for (var i = 0; i < collection.length; i++) {
                                var childScope = $scope.$new();

                                childScope[indexString] = collection[i];

                                linker(childScope, function (clone) {

                                    // Specific styles according to view type
                                    if ($attr.carouselMultiple > 1) {
                                        var viewStyles = "position:absolute;left:" + 100/$attr.carouselMultiple*i +"%;";
                                    } else {
                                        var viewStyles = "position:absolute;";
                                    }

                                    var listItem = "<li " +
                                                   "style=\""+viewStyles+"width: "+width+"%; height: 100%; transition: opacity 0.7s ease-in, transform 1s linear; background-size: cover; background-position: 50% 0%;\" " +
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