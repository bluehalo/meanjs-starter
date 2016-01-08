'use strict';

angular.module('asymmetrik.util')
    .directive('inplaceEdit',
        [ '$document', '$timeout', function($document, $timeout) {
            return {
                restrict: 'EA',
                templateUrl: 'app/util/views/inplace-edit.client.view.html',
                scope: {
                    ngModel: '=',
                    onChange: '&'
                },
                link: function($scope, $element) {
                    $scope.editing = false;
                    var inputEl = $element.find('input');

                    inputEl.on('change', function() {
                        $scope.onChange();
                    });

                    // watches the document to see if a click comes in outside of the component
                    // we only want to keep this event bound while the directive is editing
                    var clickOutsideHandler = function (e) {
                        if ($element !== e.target && !$element[0].contains(e.target)) {
                            $scope.$apply(function() {
                                $scope.editing = false;
                            });
                            $document.unbind('click', clickOutsideHandler);
                        }
                    };

                    // watch for enter key
                    $scope.handleKeyPress = function(e) {
                        if (e.keyCode === 13) {
                            $scope.editing = false;
                            $document.unbind('click', clickOutsideHandler);
                        }
                    };

                    // toggle the edit mode and bind or unbind the event handler
                    $scope.toggleEditing = function() {
                        if ($scope.editing) {
                            $scope.editing = false;
                            $document.unbind('click', clickOutsideHandler);
                        } else {
                            $scope.editing = true;
                            $document.on('click', clickOutsideHandler);

                            $timeout(function() {
                                inputEl[0].select();
                            });
                        }
                    };
                }
            };
        }]);