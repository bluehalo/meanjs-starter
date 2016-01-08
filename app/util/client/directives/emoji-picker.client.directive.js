'use strict';

angular.module('asymmetrik.util')
	.directive('emojiPicker', function() {
		return {
			restrict: 'A',
			link: function ($scope, element, attrs) {
				var height = 450, width = 350;

				if (null != attrs.emojiPickerHeight) {
					height = attrs.emojiPickerHeight;
				}
				if (null != attrs.emojiPickerWidth) {
					width = attrs.emojiPickerWidth;
				}

				var elt = angular.element(element);
				elt.emojiPicker({
					height: height,
					width:  width,
					button: false
				});

				// Add our own emoji button next to the text input as a bootstrap input group
				elt.parent().addClass('input-group');

				angular.element('<div>')
					.addClass('input-group-addon btn emoji-picker-btn')
					.append('<div class="emoji emoji-grinning"/>&nbsp;<i class="fa fa-caret-down"/>')
					.on('click', function() {
						elt.emojiPicker('toggle');
					})
					.insertAfter(elt);

				// Anytime the user clicks on an emoji to insert, we need to trigger an
				// onchange event for the input within an angular $digest cycle so that the
				// models update properly.
				angular.element('.emojiPicker section .emoji').on('click', function() {
					$scope.$apply(function() {
						elt.change();
					});
				});
			}
		};
	});
