(function() {
    "use strict";

    /**
     * Carousel controller defintion
     */
    function carouselController($interval, $timeout) {
        var vm = this;

        ///////////////////////////////////

        vm.activeIndex = 0;
        vm.interval = undefined;
        vm.carouselItems = [];

        ///////////////////////////////////

        var transitionTime = 1; // seconds
        var transitionTimeOverride = undefined;

        /**
         * Debug
         */
        function log(text) {
            // console.log(text);
        }

        /**
         * Slider css
         */
        function getCurrentClass(index) {
            if (vm.activeIndex == index) {
                return "active";
            }
            return "";
        }

        function getOpacity(index) {
            vm.carouselMultiple = parseInt(vm.carouselMultiple);
            if (vm.carouselMultiple > 1) {
                return getOpacityForMultiple(index);
            } else {
                return getOpacityForRegular(index);
            }

            function getOpacityForMultiple(index) {
                if (index === (vm.carouselItems.length - 1) && vm.activeIndex === 1 && (vm.activeIndex + vm.carouselMultiple - 1) < index) {
                    return 0;
                }
                if (index === (vm.carouselItems.length - 1) && vm.activeIndex === 0) {
                    return 1;
                }
                if (index === (vm.activeIndex - 1) || index === vm.activeIndex) {
                    return 1;
                }
                if (index > vm.activeIndex && index <= (vm.activeIndex + vm.carouselMultiple - 1)) {
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

            function getOpacityForRegular(index) {
                if (index === 0) {
                    // first
                    if (vm.activeIndex === vm.carouselItems.length - 1 && vm.carouselItems.length > 2) {
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
            vm.carouselMultiple = parseInt(vm.carouselMultiple);
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
                if (vm.carouselMultiple >= vm.carouselItems.length) {
                    return index * 100;
                }

                percentage = -((vm.activeIndex - index) * 100);
                if (vm.activeIndex === 0 && index === vm.carouselItems.length - 1 && (vm.activeIndex + vm.carouselMultiple - 1) < index) {
                    percentage = -100;
                }
                if (index < (vm.activeIndex - 1)) {
                    percentage = vm.carouselMultiple * 100;
                }
                if (vm.activeIndex >= (vm.carouselItems.length - vm.carouselMultiple) && index < (vm.activeIndex - 1)) {
                    percentage = ((vm.carouselItems.length - vm.activeIndex) + index) * 100;
                }

                return percentage;

            }

            function getStyleForRegular(index, percentage) {
                if (vm.activeIndex === 0 && index === vm.carouselItems.length - 1) {
                    if (vm.carouselItems.length === 2) {
                        return 100;
                    }
                    return -100;
                } else {
                    if (vm.activeIndex === vm.carouselItems.length - 1 && index === 0) {
                        if (vm.carouselItems.length === 2) {
                            return -100;
                        }
                        return 100;
                    } else {
                        if (vm.activeIndex > index) {
                            return -100;
                        } else {
                            if (vm.activeIndex < index) {
                                return 100;
                            }
                        }
                    }
                }
            }

            var animationTransitionTime = transitionTime;
            if (transitionTimeOverride) {
                animationTransitionTime = transitionTimeOverride;
            }

            log(animationTransitionTime);

            return {
                'background-image': (item.src !== undefined) ? "url(" + item.src + ")" : "none",
                'transform': "translateX(" + percentage + "%)",
                '-webkit-transition': "transform " + animationTransitionTime + "s linear",
                'transition': "transform " + animationTransitionTime + "s linear",
                'opacity': getOpacity(index),
                'z-index': getOpacity(index)
            };
        }

        /**
         * Navigation control functions
         */
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
            }, vm.carouselDuration * transitionTime * 1000);
        }

        function goToIndex(index) {
            var item = vm.carouselItems[index];

            // FUNCTIONS
            function getCountForLeft() {
                if (index < vm.activeIndex) {
                    return vm.activeIndex - index;
                }
                return vm.carouselItems.length - index + vm.activeIndex;
            }

            function getCountForRight() {
                if (index > vm.activeIndex) {
                    return index - vm.activeIndex;
                }
                return vm.carouselItems.length - vm.activeIndex + index;
            }

            function moveLeft(count, stepTransitionTime) {
                if (count <= 0) {
                    handleEndOfGoto();
                    return;
                }
                if (vm.activeIndex <= 0) {
                    vm.activeIndex = vm.carouselItems.length - 1;
                } else {
                    vm.activeIndex--;
                }

                $timeout(function(){
                    moveLeft(count - 1, stepTransitionTime);
                }, stepTransitionTime*1000);
            }

            function moveRight(count, stepTransitionTime) {
                if (count <= 0) {
                    handleEndOfGoto();
                    return;
                }
                if (vm.activeIndex >= vm.carouselItems.length - 1) {
                    vm.activeIndex = 0;
                } else {
                    vm.activeIndex++;
                }

                $timeout(function(){
                    moveRight(count - 1, stepTransitionTime);
                }, stepTransitionTime*1000);
            }

            function computeTransitionOverride(count) {
                return (transitionTime / count) * Math.log(count);
            }

            function handleEndOfGoto() {
                if(vm.carouselNavigationCallback) {
                    vm.carouselNavigationCallback(item);
                }
                transitionTimeOverride = undefined;
                vm.restart();
            }

            // LOGIC

            if (vm.activeIndex === index) {
                // Clicked on active item
                return;
            }

            vm.pause();

            var leftCount = getCountForLeft();
            var rightCount = getCountForRight();

            if (leftCount < rightCount) {
                transitionTimeOverride = computeTransitionOverride(leftCount);
                moveLeft(leftCount, transitionTimeOverride);
            } else {
                transitionTimeOverride = computeTransitionOverride(rightCount);
                moveRight(rightCount, transitionTimeOverride);
            }
        }

        function goToPrev() {
            if (vm.interval) {
                $interval.cancel(vm.interval);
            }

            if (vm.activeIndex === 0){
                vm.activeIndex = vm.carouselItems.length - 1;
            } else {
                vm.activeIndex--;
            }
        }

        function goToNext() {
            if (vm.interval) {
                $interval.cancel(vm.interval);
            }
            if (vm.activeIndex === vm.carouselItems.length - 1 || vm.activeIndex >= vm.carouselItems.length) {
                vm.activeIndex = 0;
            } else {
                vm.activeIndex++;
            }
        }

        function isNavVisible() {
            if (vm.carouselMultiple) {
                return vm.carouselItems.length > vm.carouselMultiple;
            }
            if (vm.carouselItems.length < 2) {
                return false;
            }
            return true;
        }

        ///////////////////////////////////

        vm.getStyle = getStyle;
        vm.pause = pause;
        vm.restart = restart;
        vm.goToIndex = goToIndex;
        vm.getCurrentClass = getCurrentClass;
        vm.goToPrev = goToPrev;
        vm.goToNext = goToNext;
        vm.isNavVisible = isNavVisible;

        //////////////////////////////////

        // vm.restart();
    }

    carouselController.$inject = ["$interval", "$timeout"];

    /**
    * Directive definition
     */
    function carouselDirective($compile) {
        return {
            restrict: "EA",
            scope: {
                carouselItemClassName: "@",
                carouselDuration: "@",
                carouselMultiple: "@",
                carouselControls: "@",
                carouselNavigationCallback: "="
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
                if (!attr.carouselNavigationCallback) {
                    attr.$set("carouselNavigationCallback", "undefined");
                }
                return {
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

                        var controls = "<div class=\"controls\">" +
                            "<span class=\"carousel-prev\" data-ng-click=\"carousel.goToPrev()\" data-ng-if=\"carousel.isNavVisible()\"><</span>" +
                            "<span class=\"carousel-next\" data-ng-click=\"carousel.goToNext()\" data-ng-if=\"carousel.isNavVisible()\">></span>" +
                            "</div>";

                        $element.append(container);

                        if (typeof ($attr.carouselControls) != "undefined") {
                            $element.prepend(controls);
                        }

                        var parent = $element.find("ul");

                        $scope.$parent.$watchCollection(collectionString, function(collection) {

                            var width = 100 / $attr.carouselMultiple;

                            for (var i = 0; i < collection.length; i++) {
                                var childScope = $scope.$new();

                                childScope[indexString] = collection[i];

                                linker(childScope, function(clone) {

                                    var listItem = "<li " +
                                        "style=\"position:absolute;width: " + width + "%; height: 100%; background-size: cover; background-position: 50% 0%;transition-property: all!important;\"" +
                                        "data-ng-mouseenter=\"carousel.pause()\" " +
                                        "data-ng-mouseleave=\"carousel.restart()\" " +
                                        "data-ng-click=\"carousel.goToIndex(" + i + ")\" " +
                                        "data-ng-style=\"carousel.getStyle(" + i + ")\" " +
                                        "class=\"" + $attr.carouselItemClassName + " \">" +
                                        // "data-ng-class=\"carousel.getCurrentClass("+i+")\"" +
                                        "</li>";

                                    // clone the transcluded element, passing in the new scope.
                                    parent.append(listItem); // add to DOM

                                    var liElements = parent.find("li");
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
                        var controlsEl = angular.element($element.find(".controls"));
                        $compile(controlsEl)($scope);
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
