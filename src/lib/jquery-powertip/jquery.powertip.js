/**
 * PowerTip Core
 *
 * @fileoverview  Core variables, plugin object, and API.
 * @link          http://stevenbenner.github.com/jquery-powertip/
 * @author        Steven Benner (http://stevenbenner.com/)
 * @requires      jQuery 1.7+
 */

// useful private variables
var $document = $(window.document),
	$window = $(window),
	$body = $('body'),
	RAD2DEG = 180 / Math.PI;

/**
 * Session data
 * Private properties global to all powerTip instances
 */
var session = {
	isTipOpen: false,
	isFixedTipOpen: false,
	isClosing: false,
	tipOpenImminent: false,
	activeHover: null,
	currentX: 0,
	currentY: 0,
	previousX: 0,
	previousY: 0,
	desyncTimeout: null,
	mouseTrackingActive: false
};

/**
 * Display hover tooltips on the matched elements.
 * @param {(Object|string)} opts The options object to use for the plugin, or the
 *     name of a method to invoke on the first matched element.
 * @param {*=} [arg] Argument for an invoked method (optional).
 * @return {$} jQuery object for the matched selectors.
 */
$.fn.powerTip = function(opts, arg) {

	// don't do any work if there were no matched elements
	if (!this.length) {
		return this;
	}

	// handle api method calls on the plugin, e.g. powerTip('hide')
	if (typeof opts === 'string' && $.powerTip[opts]) {
		return $.powerTip[opts].call(this, this, arg);
	}

	// extend options
	var options = $.extend({}, $.fn.powerTip.defaults, opts),
		tipController = new TooltipController(options);

	// hook mouse tracking
	initMouseTracking();

	// setup the elements
	this.each(function elementSetup() {
		var $this = $(this),
			dataPowertip = $this.data('powertip'),
			dataElem = $this.data('powertipjq'),
			dataTarget = $this.data('powertiptarget'),
			title = $this.attr('title');

		// handle repeated powerTip calls on the same element by destroying
		// the original instance hooked to it and replacing it with this call
		if ($this.data('displayController')) {
			$.powerTip.destroy($this);
			title = $this.attr('title');
		}

		// attempt to use title attribute text if there is no data-powertip,
		// data-powertipjq or data-powertiptarget. If we do use the title
		// attribute, delete the attribute so the browser will not show it
		if (!dataPowertip && !dataTarget && !dataElem && title) {
			$this.data({powertip: title, originalTitle: title}).removeAttr('title');
		}

		// create hover controllers for each element
		$this.data(
			'displayController',
			new DisplayController($this, options, tipController)
		);
	});

	// attach events to matched elements if the manual options is not enabled
	if (!options.manual) {
		this.on({
			// mouse events
			'mouseenter.powertip': function elementMouseEnter(event) {
				elementShowAndTrack(this, event);
			},
			'mouseleave.powertip': function elementMouseLeave() {
				elementHideTip(this);
			},

			// keyboard events
			'focus.powertip': function elementFocus() {
				elementShowTip(this, true);
			},
			'blur.powertip': function elementBlur() {
				elementHideTip(this, true);
			},
			'keydown.powertip': function elementKeyDown(event) {
				// close tooltip when the escape key is pressed
				if (event.keyCode === 27) {
					elementHideTip(this, true);
				}
			}
		});
	}

	return this;

};

/**
 * Default options for the powerTip plugin.
 */
$.fn.powerTip.defaults = {
	fadeInTime: 200,
	fadeOutTime: 100,
	followMouse: false,
	popupId: 'powerTip',
	intentSensitivity: 7,
	intentPollInterval: 100,
	closeDelay: 100,
	placement: 'n',
	smartPlacement: false,
	offset: 10,
	mouseOnToPopup: false,
	manual: false
};

/**
 * Default smart placement priority lists.
 * The first item in the array is the highest priority, the last is the
 * lowest. The last item is also the default, which will be used if all
 * previous options do not fit.
 */
$.fn.powerTip.smartPlacementLists = {
	n: ['n', 'ne', 'nw', 's'],
	e: ['e', 'ne', 'se', 'w', 'nw', 'sw', 'n', 's', 'e'],
	s: ['s', 'se', 'sw', 'n'],
	w: ['w', 'nw', 'sw', 'e', 'ne', 'se', 'n', 's', 'w'],
	nw: ['nw', 'w', 'sw', 'n', 's', 'se', 'nw'],
	ne: ['ne', 'e', 'se', 'n', 's', 'sw', 'ne'],
	sw: ['sw', 'w', 'nw', 's', 'n', 'ne', 'sw'],
	se: ['se', 'e', 'ne', 's', 'n', 'nw', 'se'],
	'nw-alt': ['nw-alt', 'n', 'ne-alt', 'nw', 'ne', 'w', 'sw-alt', 's', 'se-alt', 'sw', 'se', 'e'],
	'ne-alt': ['ne-alt', 'n', 'nw-alt', 'ne', 'nw', 'e', 'se-alt', 's', 'sw-alt', 'se', 'sw', 'w'],
	'sw-alt': ['sw-alt', 's', 'se-alt', 'sw', 'se', 'w', 'nw-alt', 'n', 'ne-alt', 'nw', 'ne', 'e'],
	'se-alt': ['se-alt', 's', 'sw-alt', 'se', 'sw', 'e', 'ne-alt', 'n', 'nw-alt', 'ne', 'nw', 'w']
};


/**
 * Public API
 */
$.powerTip = {

	/**
	 * Attempts to show the tooltip for the specified element.
	 * @public
	 * @param {$} element The element that the tooltip should for.
	 * @param {$.Event=} event jQuery event for hover intent and mouse tracking (optional).
	 */
	showTip: function apiShowTip(element, event) {
		if (event) {
			elementShowAndTrack(element.first(), event);
		} else {
			elementShowTip(element.first(), true, true);
		}
		return element;
	},

	/**
	 * Repositions the tooltip on the element.
	 * @public
	 * @param {$} element The element that the tooltip is shown for.
	 */
	resetPosition: function apiResetPosition(element) {
		element.first().data('displayController').resetPosition();
		return element;
	},

	/**
	 * Attempts to close any open tooltips.
	 * @public
	 * @param {$=} element A specific element whose tip should be closed (optional).
	 * @param {boolean=} immediate Disable close delay (optional).
	 */
	closeTip: function apiCloseTip(element, immediate) {
		if (element) {
			elementHideTip(element.first(), immediate);
		} else {
			$document.triggerHandler('closePowerTip');
		}
		return element;
	},

	/**
	 * Destroy and roll back any powerTip() instance on the specified element.
	 * @public
	 * @param {$} element The element with the powerTip instance.
	 */
	destroy: function apiDestroy(element) {
		return element.off('.powertip').each(function destroy() {
			var $this = $(this);

			if ($this.data('originalTitle')) {
				$this.attr('title', $this.data('originalTitle'));
			}

			$this.removeData([
				'originalTitle',
				'displayController',
				'hasActiveHover',
				'forcedOpen'
			]);
		});
	}

};

// API aliasing
$.powerTip.show = $.powerTip.showTip;
$.powerTip.hide = $.powerTip.closeTip;

// Common utility functions

/**
 * Asks the DisplayController for the specified element to show() its tooltip.
 * @private
 * @param {$} el The element that the tooltip should be shown for.
 * @param {boolean=} immediate Skip intent testing (optional).
 * @param {boolean=} forcedOpen Ignore cursor position and force tooltip to open (optional).
 */
function elementShowTip(el, immediate, forcedOpen) {
	$(el).data('displayController').show(immediate, forcedOpen);
}

/**
 * Tracks the mouse cursor position specified in the event and attempts to open
 * the tooltip for the specified element.
 * @private
 * @param {$} el The element that the tooltip should be shown for.
 * @param {$.Event} event The event with pageX and pageY info.
 */
function elementShowAndTrack(el, event) {
	trackMouse(event);
	session.previousX = event.pageX;
	session.previousY = event.pageY;
	elementShowTip(el);
}

/**
 * Asks the DisplayController for the specified element to hide() its tooltip.
 * @private
 * @param {$} el The element that the tooltip should be shown for.
 * @param {boolean=} immediate Disable close delay (optional).
 */
function elementHideTip(el, immediate) {
	$(el).data('displayController').hide(immediate);
}
/**
 * PowerTip DisplayController
 *
 * @fileoverview  DisplayController object used to manage tooltips for elements.
 * @link          http://stevenbenner.github.com/jquery-powertip/
 * @author        Steven Benner (http://stevenbenner.com/)
 * @requires      jQuery 1.7+
 */

/**
 * Creates a new tooltip display controller.
 * @private
 * @constructor
 * @param {$} element The element that this controller will handle.
 * @param {Object} options Options object containing settings.
 * @param {TooltipController} tipController The TooltipController for this instance.
 */
function DisplayController(element, options, tipController) {
	var hoverTimer = null;

	/**
	 * Begins the process of showing a tooltip.
	 * @private
	 * @param {boolean=} immediate Skip intent testing (optional).
	 * @param {boolean=} forceOpen Ignore cursor position and force tooltip to open (optional).
	 */
	function openTooltip(immediate, forceOpen) {
		cancelTimer();
		if (!element.data('hasActiveHover')) {
			if (!immediate) {
				session.tipOpenImminent = true;
				hoverTimer = setTimeout(
					function intentDelay() {
						hoverTimer = null;
						checkForIntent();
					},
					options.intentPollInterval
				);
			} else {
				if (forceOpen) {
					element.data('forcedOpen', true);
				}
				tipController.showTip(element);
			}
		}
	}

	/**
	 * Begins the process of closing a tooltip.
	 * @private
	 * @param {boolean=} disableDelay Disable close delay (optional).
	 */
	function closeTooltip(disableDelay) {
		cancelTimer();
		session.tipOpenImminent = false;
		if (element.data('hasActiveHover')) {
			element.data('forcedOpen', false);
			if (!disableDelay) {
				hoverTimer = setTimeout(
					function closeDelay() {
						hoverTimer = null;
						tipController.hideTip(element);
					},
					options.closeDelay
				);
			} else {
				tipController.hideTip(element);
			}
		}
	}

	/**
	 * Checks mouse position to make sure that the user intended to hover
	 * on the specified element before showing the tooltip.
	 * @private
	 */
	function checkForIntent() {
		// calculate mouse position difference
		var xDifference = Math.abs(session.previousX - session.currentX),
			yDifference = Math.abs(session.previousY - session.currentY),
			totalDifference = xDifference + yDifference;

		// check if difference has passed the sensitivity threshold
		if (totalDifference < options.intentSensitivity) {
			tipController.showTip(element);
		} else {
			// try again
			session.previousX = session.currentX;
			session.previousY = session.currentY;
			openTooltip();
		}
	}

	/**
	 * Cancels active hover timer.
	 * @private
	 */
	function cancelTimer() {
		hoverTimer = clearTimeout(hoverTimer);
	}

	/**
	 * Repositions the tooltip on this element.
	 * @private
	 */
	function repositionTooltip() {
		tipController.resetPosition(element);
	}

	// expose the methods
	this.show = openTooltip;
	this.hide = closeTooltip;
	this.cancel = cancelTimer;
	this.resetPosition = repositionTooltip;
}
/**
 * PowerTip TooltipController
 *
 * @fileoverview  TooltipController object that manages tooltips for an instance.
 * @link          http://stevenbenner.github.com/jquery-powertip/
 * @author        Steven Benner (http://stevenbenner.com/)
 * @requires      jQuery 1.7+
 */

/**
 * Creates a new tooltip controller.
 * @private
 * @constructor
 * @param {Object} options Options object containing settings.
 */
function TooltipController(options) {

	// build and append tooltip div if it does not already exist
	var tipElement = $('#' + options.popupId);
	if (tipElement.length === 0) {
		tipElement = $('<div/>', { id: options.popupId });
		// grab body element if it was not populated when the script loaded
		// this hack exists solely for jsfiddle support
		if ($body.length === 0) {
			$body = $('body');
		}
		$body.append(tipElement);
	}

	// hook mousemove for cursor follow tooltips
	if (options.followMouse) {
		// only one positionTipOnCursor hook per tooltip element, please
		if (!tipElement.data('hasMouseMove')) {
			$document.on({
				mousemove: positionTipOnCursor,
				scroll: positionTipOnCursor
			});
			tipElement.data('hasMouseMove', true);
		}
	}

	// if we want to be able to mouse onto the tooltip then we need to
	// attach hover events to the tooltip that will cancel a close request
	// on hover and start a new close request on mouseleave
	if (options.mouseOnToPopup) {
		tipElement.on({
			mouseenter: function tipMouseEnter() {
				// we only let the mouse stay on the tooltip if it is set
				// to let users interact with it
				if (tipElement.data('mouseOnToPopup')) {
					// check activeHover in case the mouse cursor entered
					// the tooltip during the fadeOut and close cycle
					if (session.activeHover) {
						session.activeHover.data('displayController').cancel();
					}
				}
			},
			mouseleave: function tipMouseLeave() {
				// check activeHover in case the mouse cursor entered
				// the tooltip during the fadeOut and close cycle
				if (session.activeHover) {
					session.activeHover.data('displayController').hide();
				}
			}
		});
	}

	/**
	 * Gives the specified element the active-hover state and queues up
	 * the showTip function.
	 * @private
	 * @param {$} element The element that the tooltip should target.
	 */
	function beginShowTip(element) {
		element.data('hasActiveHover', true);
		// show tooltip, asap
		tipElement.queue(function queueTipInit(next) {
			showTip(element);
			next();
		});
	}

	/**
	 * Shows the tooltip, as soon as possible.
	 * @private
	 * @param {$} element The element that the tooltip should target.
	 */
	function showTip(element) {
		var tipContent;

		// it is possible, especially with keyboard navigation, to move on
		// to another element with a tooltip during the queue to get to
		// this point in the code. if that happens then we need to not
		// proceed or we may have the fadeout callback for the last tooltip
		// execute immediately after this code runs, causing bugs.
		if (!element.data('hasActiveHover')) {
			return;
		}

		// if the tooltip is open and we got asked to open another one then
		// the old one is still in its fadeOut cycle, so wait and try again
		if (session.isTipOpen) {
			if (!session.isClosing) {
				hideTip(session.activeHover);
			}
			tipElement.delay(100).queue(function queueTipAgain(next) {
				showTip(element);
				next();
			});
			return;
		}

		// trigger powerTipPreRender event
		element.trigger('powerTipPreRender');

		// set tooltip content
		tipContent = getTooltipContent(element);
		if (tipContent) {
			tipElement.empty().append(tipContent);
		} else {
			// we have no content to display, give up
			return;
		}

		// trigger powerTipRender event
		element.trigger('powerTipRender');

		// hook close event for triggering from the api
		$document.on('closePowerTip', function closePowerTipEvent() {
			element.data('displayController').hide(true);
		});

		session.activeHover = element;
		session.isTipOpen = true;

		tipElement.data('followMouse', options.followMouse);
		tipElement.data('mouseOnToPopup', options.mouseOnToPopup);

		// set tooltip position
		if (!options.followMouse) {
			positionTipOnElement(element);
			session.isFixedTipOpen = true;
		} else {
			positionTipOnCursor();
		}

		// fadein
		tipElement.fadeIn(options.fadeInTime, function fadeInCallback() {
			// start desync polling
			if (!session.desyncTimeout) {
				session.desyncTimeout = setInterval(closeDesyncedTip, 500);
			}

			// trigger powerTipOpen event
			element.trigger('powerTipOpen');
		});
	}

	/**
	 * Hides the tooltip.
	 * @private
	 * @param {$} element The element that the tooltip should target.
	 */
	function hideTip(element) {
		session.isClosing = true;
		element.data('hasActiveHover', false);
		element.data('forcedOpen', false);
		// reset session
		session.activeHover = null;
		session.isTipOpen = false;
		// stop desync polling
		session.desyncTimeout = clearInterval(session.desyncTimeout);
		// unhook close event api listener
		$document.off('closePowerTip');
		// fade out
		tipElement.fadeOut(options.fadeOutTime, function fadeOutCallback() {
			session.isClosing = false;
			session.isFixedTipOpen = false;
			tipElement.removeClass();
			// support mouse-follow and fixed position tips at the same
			// time by moving the tooltip to the last known cursor location
			// after it is hidden
			setTipPosition(
				session.currentX + options.offset,
				session.currentY + options.offset
			);

			// trigger powerTipClose event
			element.trigger('powerTipClose');
		});
	}

	/**
	 * Checks for a tooltip desync and closes the tooltip if one occurs.
	 * @private
	 */
	function closeDesyncedTip() {
		// It is possible for the mouse cursor to leave an element without
		// firing the mouseleave or blur event. This most commonly happens
		// when the element is disabled under mouse cursor. If this happens
		// it will result in a desynced tooltip because the tooltip was
		// never asked to close. So we should periodically check for a
		// desync situation and close the tip if such a situation arises.
		if (session.isTipOpen && !session.isClosing) {
			var isDesynced = false;
			// user moused onto another tip or active hover is disabled
			if (session.activeHover.data('hasActiveHover') === false || session.activeHover.is(':disabled')) {
				isDesynced = true;
			} else {
				// hanging tip - have to test if mouse position is not over
				// the active hover and not over a tooltip set to let the
				// user interact with it.
				// for keyboard navigation: this only counts if the element
				// does not have focus.
				// for tooltips opened via the api: we need to check if it
				// has the forcedOpen flag.
				if (!isMouseOver(session.activeHover) && !session.activeHover.is(":focus") && !session.activeHover.data('forcedOpen')) {
					if (tipElement.data('mouseOnToPopup')) {
						if (!isMouseOver(tipElement)) {
							isDesynced = true;
						}
					} else {
						isDesynced = true;
					}
				}
			}

			if (isDesynced) {
				// close the desynced tip
				hideTip(session.activeHover);
			}
		}
	}

	/**
	 * Moves the tooltip to the users mouse cursor.
	 * @private
	 */
	function positionTipOnCursor() {
		// to support having fixed tooltips on the same page as cursor
		// tooltips, where both instances are referencing the same tooltip
		// element, we need to keep track of the mouse position constantly,
		// but we should only set the tip location if a fixed tip is not
		// currently open, a tip open is imminent or active, and the
		// tooltip element in question does have a mouse-follow using it.
		if ((session.isTipOpen && !session.isFixedTipOpen) || (session.tipOpenImminent && !session.isFixedTipOpen && tipElement.data('hasMouseMove'))) {
			// grab measurements and collisions
			var tipWidth = tipElement.outerWidth(),
				tipHeight = tipElement.outerHeight(),
				x = session.currentX + options.offset,
				y = session.currentY + options.offset,
				collisions = getViewportCollisions(
					{ left: x, top: y },
					tipWidth,
					tipHeight
				),
				collisionCount = collisions.length;

			// handle tooltip view port collisions
			if (collisionCount > 0) {
				if (collisionCount === 1) {
					// if there is only one collision (bottom or right) then
					// simply constrain the tooltip to the view port
					if (collisions[0] === 'right') {
						x = $window.width() - tipWidth;
					} else if (collisions[0] === 'bottom') {
						y = $window.scrollTop() + $window.height() - tipHeight;
					}
				} else {
					// if the tooltip has more than one collision then it
					// is trapped in the corner and should be flipped to
					// get it out of the users way
					x = session.currentX - tipWidth - options.offset;
					y = session.currentY - tipHeight - options.offset;
				}
			}

			// position the tooltip
			setTipPosition(x, y);
		}
	}

	/**
	 * Sets the tooltip to the correct position relative to the specified
	 * target element. Based on options settings.
	 * @private
	 * @param {$} element The element that the tooltip should target.
	 */
	function positionTipOnElement(element) {
		var priorityList,
			finalPlacement;

		if (options.smartPlacement) {
			priorityList = $.fn.powerTip.smartPlacementLists[options.placement];

			// iterate over the priority list and use the first placement
			// option that does not collide with the view port. if they all
			// collide then the last placement in the list will be used.
			$.each(priorityList, function(idx, pos) {
				// place tooltip and find collisions
				var collisions = getViewportCollisions(
					placeTooltip(element, pos),
					tipElement.outerWidth(),
					tipElement.outerHeight()
				);

				// update the final placement variable
				finalPlacement = pos;

				// break if there were no collisions
				if (collisions.length === 0) {
					return false;
				}
			});
		} else {
			// if we're not going to use the smart placement feature then
			// just compute the coordinates and do it
			placeTooltip(element, options.placement);
			finalPlacement = options.placement;
		}

		// add placement as class for CSS arrows
		tipElement.addClass(finalPlacement);
	}

	/**
	 * Sets the tooltip position to the appropriate values to show the tip
	 * at the specified placement. This function will iterate and test the
	 * tooltip to support elastic tooltips.
	 * @private
	 * @param {$} element The element that the tooltip should target.
	 * @param {string} placement The placement for the tooltip.
	 * @return {Object} An object with the top, left, and right position values.
	 */
	function placeTooltip(element, placement) {
		var iterationCount = 0,
			tipWidth,
			tipHeight,
			coords;

		// for the first iteration set the tip to 0,0 to get the full
		// expanded width
		setTipPosition(0, 0);

		// to support elastic tooltips we need to check for a change in
		// the rendered dimensions after the tooltip has been positioned
		do {
			// grab the current tip dimensions
			tipWidth = tipElement.outerWidth();
			tipHeight = tipElement.outerHeight();

			// get placement coordinates
			coords = computePlacementCoords(
				element,
				placement,
				tipWidth,
				tipHeight
			);

			// place the tooltip
			tipElement.css(coords);
		} while (
			// sanity check: limit to 5 iterations, and...
			++iterationCount <= 5 &&
			// try again if the dimensions changed after placement
			(tipWidth !== tipElement.outerWidth() || tipHeight !== tipElement.outerHeight())
		);

		return coords;
	}

	/**
	 * Compute the top,left position of the specified placement for an HTML element
	 * @private
	 * @param {$} element The element that the tooltip should target.
	 * @param {string} placement The placement for the tooltip.
	 * @return {Object} An object with the top,left position values.
	 */
	function getHtmlPlacement(element, placement) {
		var objectOffset = element.offset(),
			objectWidth = element.outerWidth(),
			objectHeight = element.outerHeight(),
			left, top;

		// calculate the appropriate x and y position in the document
		switch (placement) {
		case 'n':
			left = objectOffset.left + objectWidth / 2;
			top = objectOffset.top;
			break;
		case 'e':
			left = objectOffset.left + objectWidth;
			top = objectOffset.top + objectHeight / 2;
			break;
		case 's':
			left = objectOffset.left + objectWidth / 2;
			top = objectOffset.top + objectHeight;
			break;
		case 'w':
			left = objectOffset.left;
			top = objectOffset.top + objectHeight / 2;
			break;
		case 'nw':
			left = objectOffset.left;
			top = objectOffset.top;
			break;
		case 'ne':
			left = objectOffset.left + objectWidth;
			top = objectOffset.top;
			break;
		case 'sw':
			left = objectOffset.left;
			top = objectOffset.top + objectHeight;
			break;
		case 'se':
			left = objectOffset.left + objectWidth;
			top = objectOffset.top + objectHeight;
			break;
		}

		return {
			top: top,
			left: left
		};
	}

	/**
	 * Compute the top,left position of the specified placement for a SVG element
	 * @private
	 * @param {$} element The element that the tooltip should target.
	 * @param {string} placement The placement for the tooltip.
	 * @return {Object} An object with the top,left position values.
	 */
	function getSvgPlacement(element, placement) {
		var svgElement = element.closest('svg')[0],
			domElement = element[0],
			point = svgElement.createSVGPoint(),
			boundingBox = domElement.getBBox(),
			matrix = domElement.getScreenCTM(),
			halfWidth = boundingBox.width / 2,
			halfHeight = boundingBox.height / 2,
			placements = [],
			placementKeys = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'],
			coords, rotation, steps, x;

		function pushPlacement() {
			placements.push(point.matrixTransform(matrix));
		}

		// get bounding box corners and midpoints
		point.x = boundingBox.x;
		point.y = boundingBox.y;
		pushPlacement();
		point.x += halfWidth;
		pushPlacement();
		point.x += halfWidth;
		pushPlacement();
		point.y += halfHeight;
		pushPlacement();
		point.y += halfHeight;
		pushPlacement();
		point.x -= halfWidth;
		pushPlacement();
		point.x -= halfWidth;
		pushPlacement();
		point.y -= halfHeight;
		pushPlacement();

		// determine rotation
		if (placements[0].y !== placements[1].y || placements[0].x !== placements[7].x) {
			rotation = Math.atan2(matrix.b, matrix.a) * RAD2DEG;
			steps = Math.ceil(((rotation % 360) - 22.5) / 45);
			if (steps < 1) {
				steps += 8;
			}
			while (steps--) {
				placementKeys.push(placementKeys.shift());
			}
		}

		// find placement
		for (x = 0; x < placements.length; x++) {
			if (placementKeys[x] === placement) {
				coords = placements[x];
				break;
			}
		}

		return {
			top: coords.y + $window.scrollTop(),
			left: coords.x + $window.scrollLeft()
		};
	}

	/**
	 * Compute the top/left/right CSS position to display the tooltip at the
	 * specified placement relative to the specified element.
	 * @private
	 * @param {$} element The element that the tooltip should target.
	 * @param {string} placement The placement for the tooltip.
	 * @param {number} tipWidth Width of the tooltip element in pixels.
	 * @param {number} tipHeight Height of the tooltip element in pixels.
	 * @return {Object} An object with the top, left, and right position values.
	 */
	function computePlacementCoords(element, placement, tipWidth, tipHeight) {
		var placementBase = placement.split('-')[0], // ignore 'alt' for corners
			left = 'auto',
			top = 'auto',
			right = 'auto',
			position;

		if (isSvgElement(element)) {
			position = getSvgPlacement(element, placementBase);
		} else {
			position = getHtmlPlacement(element, placementBase);
		}

		// calculate the appropriate x and y position in the document
		// ~~ here is a shorthand for Math.floor
		switch (placement) {
		case 'n':
			left = ~~(position.left - (tipWidth / 2));
			top = ~~(position.top - tipHeight - options.offset);
			break;
		case 'e':
			left = ~~(position.left + options.offset);
			top = ~~(position.top - (tipHeight / 2));
			break;
		case 's':
			left = ~~(position.left - (tipWidth / 2));
			top = ~~(position.top + options.offset);
			break;
		case 'w':
			top = ~~(position.top - (tipHeight / 2));
			right = ~~($window.width() - position.left + options.offset);
			break;
		case 'nw':
			top = ~~(position.top - tipHeight - options.offset);
			right = ~~($window.width() - position.left - 20);
			break;
		case 'nw-alt':
			left = ~~position.left;
			top = ~~(position.top - tipHeight - options.offset);
			break;
		case 'ne':
			left = ~~(position.left - 20);
			top = ~~(position.top - tipHeight - options.offset);
			break;
		case 'ne-alt':
			top = ~~(position.top - tipHeight - options.offset);
			right = ~~($window.width() - position.left);
			break;
		case 'sw':
			top = ~~(position.top + options.offset);
			right = ~~($window.width() - position.left - 20);
			break;
		case 'sw-alt':
			left = ~~position.left;
			top = ~~(position.top + options.offset);
			break;
		case 'se':
			left = ~~(position.left - 20);
			top = ~~(position.top + options.offset);
			break;
		case 'se-alt':
			top = ~~(position.top + options.offset);
			right = ~~($window.width() - position.left);
			break;
		}

		return {
			left: left,
			top: top,
			right: right
		};
	}

	/**
	 * Fetches the tooltip content from the specified element's data attributes.
	 * @private
	 * @param {$} element The element to get the tooltip content for.
	 * @return {(string|$|undefined)} The text/HTML string, jQuery object, or
	 *     undefined if there was no tooltip content for the element.
	 */
	function getTooltipContent(element) {
		var tipText = element.data('powertip'),
			tipObject = element.data('powertipjq'),
			tipTarget = element.data('powertiptarget'),
			content;

		if (tipText) {
			if (typeof tipText === 'function') {
				tipText = tipText.call(element[0]);
			}
			content = tipText;
		} else if (tipObject) {
			if (typeof tipElem === 'function') {
				tipObject = tipObject.call(element[0]);
			}
			if (tipObject.length > 0) {
				content = tipObject.clone(true, true);
			}
		} else if (tipTarget) {
			var targetElement = $('#' + tipTarget);
			if (targetElement.length > 0) {
				content = $('#' + tipTarget).html();
			}
		}

		return content;
	}

	/**
	 * Sets the tooltip CSS position on the document.
	 * @private
	 * @param {number} x Left position in pixels.
	 * @param {number} y Top position in pixels.
	 */
	function setTipPosition(x, y) {
		tipElement.css({
			left: x + 'px',
			top: y + 'px',
			right: 'auto'
		});
	}

	// expose methods
	this.showTip = beginShowTip;
	this.hideTip = hideTip;
	this.resetPosition = positionTipOnElement;
}
/**
 * PowerTip Utility Functions
 *
 * @fileoverview  Private helper functions.
 * @link          http://stevenbenner.github.com/jquery-powertip/
 * @author        Steven Benner (http://stevenbenner.com/)
 * @requires      jQuery 1.7+
 */

/**
 * Determine whether a jQuery object is an SVG element
 * @private
 * @param {$} element The element to check
 * @return {boolean} Whether this is an SVG element
 */
function isSvgElement(element) {
	return typeof window.SVGElement !== 'undefined' && element[0] instanceof window.SVGElement;
}

/**
 * Compute the width and height of an HTML or SVG element.
 * @private
 * @param {$} element The element to measure
 * @return {Object} An object with width and height values
 */
function computeElementSize(element) {
	var el = element[0],
		rect = el.getBoundingClientRect();
	// return width/height, ensuring integers
	return {
		width: ~~rect.width,
		height: ~~rect.height
	};
}

/**
 * Hooks mouse position tracking to mousemove and scroll events.
 * Prevents attaching the events more than once.
 * @private
 */
function initMouseTracking() {
	var lastScrollX = 0,
		lastScrollY = 0;

	if (!session.mouseTrackingActive) {
		session.mouseTrackingActive = true;

		// grab the current scroll position on load
		$(function getScrollPos() {
			lastScrollX = $document.scrollLeft();
			lastScrollY = $document.scrollTop();
		});

		// hook mouse position tracking
		$document.on({
			mousemove: trackMouse,
			scroll: function trackScroll() {
				var x = $document.scrollLeft(),
					y = $document.scrollTop();
				if (x !== lastScrollX) {
					session.currentX += x - lastScrollX;
					lastScrollX = x;
				}
				if (y !== lastScrollY) {
					session.currentY += y - lastScrollY;
					lastScrollY = y;
				}
			}
		});
	}
}

/**
 * Saves the current mouse coordinates to the session object.
 * @private
 * @param {$.Event} event The mousemove event for the document.
 */
function trackMouse(event) {
	session.currentX = event.pageX;
	session.currentY = event.pageY;
}

/**
 * Tests if the mouse is currently over the specified element.
 * @private
 * @param {$} element The element to check for hover.
 * @return {boolean}
 */
function isMouseOver(element) {
	var elementPosition = element.offset(),
		elementSize = computeElementSize(element);
	return session.currentX >= elementPosition.left &&
		session.currentX <= elementPosition.left + elementSize.width &&
		session.currentY >= elementPosition.top &&
		session.currentY <= elementPosition.top + elementSize.height;
}

/**
 * Finds any viewport collisions that an element (the tooltip) would have
 * if it were absolutely positioned at the specified coordinates.
 * @private
 * @param {Object} coords Coordinates for the element. (e.g. {top: 123, left: 123})
 * @param {number} elementWidth Width of the element in pixels.
 * @param {number} elementHeight Height of the element in pixels.
 * @return {Array.<string>} Array of words representing directional collisions.
 */
function getViewportCollisions(coords, elementWidth, elementHeight) {
	var scrollLeft = $window.scrollLeft(),
		scrollTop = $window.scrollTop(),
		windowWidth = $window.width(),
		windowHeight = $window.height(),
		collisions = [];

	if (coords.top < scrollTop) {
		collisions.push('top');
	}
	if (coords.top + elementHeight > scrollTop + windowHeight) {
		collisions.push('bottom');
	}
	if (coords.left < scrollLeft || coords.right + elementWidth > scrollLeft + windowWidth) {
		collisions.push('left');
	}
	if (coords.left + elementWidth > scrollLeft + windowWidth || coords.right < scrollLeft) {
		collisions.push('right');
	}

	return collisions;
}
