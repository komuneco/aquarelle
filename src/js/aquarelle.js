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
				$.tipSwift.defaultCfg =
				{
					delayIn:	0,							// delay before showing tooltip (ms)
					delayOut:	0,							// delay before hiding tooltip (ms)
					fade:		false,						// fade tooltips in/out?
					fallback:	'',							// fallback text to use when no tooltip text
					title:		'title',					// attribute/callback containing tooltip text
					trigger:	'hover',					// how tooltip is triggered - hover | focus | manual
					
					live:		true,						// wether to use live type of event binding
					offset:		0,							// offset from the element edge in pixel
					opacity:	0.9,						// opacity [0..1]
					showEffect:	$.tipSwift.effects.show,	// effect used to show the tip
					hideEffect:	$.tipSwift.effects.hide,	// effect used to hide the tip (must eventually remove() the tip)
					extraClass:	[],							// extra classes to add the tip
					html:		true						// wether to use html for the tip content
				};
				
				$('.tooltip-n')		.tipSwift({plugins: [$.tipSwift.plugins.tip({gravity: 'n'})]});
				$('.tooltip-ne')	.tipSwift({plugins: [$.tipSwift.plugins.tip({gravity: 'ne'})]});
				$('.tooltip-e')		.tipSwift({plugins: [$.tipSwift.plugins.tip({gravity: 'e'})]});
				$('.tooltip-se')	.tipSwift({plugins: [$.tipSwift.plugins.tip({gravity: 'se'})]});
				$('.tooltip-s')		.tipSwift({plugins: [$.tipSwift.plugins.tip({gravity: 's'})]});
				$('.tooltip-sw')	.tipSwift({plugins: [$.tipSwift.plugins.tip({gravity: 'sw'})]});
				$('.tooltip-w')		.tipSwift({plugins: [$.tipSwift.plugins.tip({gravity: 'w'})]});
				$('.tooltip-nw')	.tipSwift({plugins: [$.tipSwift.plugins.tip({gravity: 'nw'})]});
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

