/*
Aquarelle, The creative & opensource CSS framework.
Copyright (C) 2012 Floris MORICEAU <floris.moriceau@komuneco.org> and Guillaume AMAT <guillaume.amat@komuneco.org>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

(
	function($)
	{
		function On_dropdown_mouseleave(element)
		{
			if ($(element).has(':focus').length > 0)
			{
				$(element)
				.addClass('child-has-focus')
				.find(':focus')
				.one
				(
					'blur',
					function()
					{
						setTimeout
						(
							function()
							{
								On_dropdown_mouseleave(element);
							},
							100
						);
					}
				);
			}
			else
			{
				$(element).removeClass('child-has-focus');
			}
		}
		
		
		
		
		function On_tooltip_mouseenter(element, event, placement)
		{
			var title = $(element).attr('title');
			
			if (typeof(title) != 'undefined')
			{
				if (title != $(element).data('powertip'))
				{
					$(element).data('powertip', title);
				}
				
				$(element).removeAttr('title');
			}
			
			$(element).powerTip
			({
				manual:		true,
				placement:	placement
			});
			
			return $(element).powerTip('show', event);
		}
		
		
		function On_tooltip_mouseleave(element)
		{
			return $(element).powerTip('hide');
		}
		
		
		
		
		$(document).ready
		(
			function()
			{
				// Fills files input when a file is selected
				$(document).on
				(
					'change',
					'.input-file > input[type=file].real-input-file',
					function()
					{
						$(this)
						.parent()
						.find('.fake-input-file > input[type=text]')
						.val(this.value);
					}
				);
				
				
				
				// Lets dropdown menus opened when a child has the focus
				$(document).on
				(
					'mouseleave',
					'.hover-dropdown-list ul, .focus-dropdown-list ul, .dropdown-top-menu ul, .dropdown-side-menu ul',
					function()
					{
						On_dropdown_mouseleave(this);
					}
				);
				
				
				
				// Buttons don't have focus on mouse click...
				$(document).on
				(
					'click',
					'.focus-dropdown-list > :button',
					function()
					{
						$(this).focus();
					}
				);
				
				
				
				// Better tooltips
				$.fn.powerTip.defaults.smartPlacement = true;
				
				$(document)
				.on('mouseenter', '.tooltip-n',			function(event){ On_tooltip_mouseenter(this, event, 'n'); })
				.on('mouseenter', '.tooltip-ne',		function(event){ On_tooltip_mouseenter(this, event, 'ne'); })
				.on('mouseenter', '.tooltip-ne-alt',	function(event){ On_tooltip_mouseenter(this, event, 'ne-alt'); })
				.on('mouseenter', '.tooltip-e',			function(event){ On_tooltip_mouseenter(this, event, 'e'); })
				.on('mouseenter', '.tooltip-se',		function(event){ On_tooltip_mouseenter(this, event, 'se'); })
				.on('mouseenter', '.tooltip-se-alt',	function(event){ On_tooltip_mouseenter(this, event, 'se-alt'); })
				.on('mouseenter', '.tooltip-s',			function(event){ On_tooltip_mouseenter(this, event, 's'); })
				.on('mouseenter', '.tooltip-sw',		function(event){ On_tooltip_mouseenter(this, event, 'sw'); })
				.on('mouseenter', '.tooltip-sw-alt',	function(event){ On_tooltip_mouseenter(this, event, 'sw-alt'); })
				.on('mouseenter', '.tooltip-w',			function(event){ On_tooltip_mouseenter(this, event, 'w'); })
				.on('mouseenter', '.tooltip-nw',		function(event){ On_tooltip_mouseenter(this, event, 'nw'); })
				.on('mouseenter', '.tooltip-nw-alt',	function(event){ On_tooltip_mouseenter(this, event, 'nw-alt'); })
				.on
				(
					'mouseleave',
					'.tooltip-n, .tooltip-ne, .tooltip-ne-alt, .tooltip-e, .tooltip-se, .tooltip-se-alt, .tooltip-s, .tooltip-sw, .tooltip-sw-alt, .tooltip-w, .tooltip-nw, .tooltip-nw-alt',
					function()
					{
						On_tooltip_mouseleave(this);
					}
				);
			}
		);
	}
)(jQuery);




// Make these elements available for non-HTML5 browsers
var i, html5_elements = ['address', 'article', 'aside', 'audio', 'canvas', 'command', 'datalist', 'details', 'dialog', 'figure', 'figcaption', 'footer', 'header', 'hgroup', 'keygen', 'mark', 'meter', 'menu', 'nav', 'progress', 'ruby', 'section', 'time', 'video'];

for(i in html5_elements)
{
	document.createElement(html5_elements[i]);
}

i = html5_elements = undefined;

