/*
Aquarelle, The creative & opensource CSS framework.
Copyright (C) 2012 Floris MORICEAU <floris@floris-moriceau.info> and Guillaume AMAT <mozzito@free.fr>

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
		function Init_grid()
		{
			var columns, i;
			
			columns = '';
			
			for (i = 1; i < 24; i++)
			{
				columns += '<div class="span-1"><div class="span-1">'+ i +'<br/><span class="column_size">'+ ((i * 40) - 10) +'px</span></div></div>';
			}
			
			columns += '<div class="span-1 last"><div class="span-1">24<br/><span class="column_size">950px</span></div></div>';
			
			
			$('<div id="aquarelle_grid" class="container"></div>')
			.appendTo('body')
			.append(columns);
		}


		function Toggle_grid()
		{
			if ($('#aquarelle_grid').is(':visible'))
			{
				Hide_grid();
			}
			else
			{
				Show_grid();
			}
		}


		function Show_grid()
		{
			$('#aquarelle_grid').show();
			
			$('#button_grid')
			.addClass('button-dark')
			.removeClass('button-light');
			
			if (window.sessionStorage)
			{
				sessionStorage.setItem('aquarelle_grid_display', 1);
			}
		}


		function Hide_grid()
		{
			$('#aquarelle_grid').hide();
			
			$('#button_grid')
			.addClass('button-light')
			.removeClass('button-dark');
			
			if (window.sessionStorage)
			{
				sessionStorage.setItem('aquarelle_grid_display', 0);
			}
		}



		$(document).ready
		(
			function()
			{
				// Create DOM elements for the grid
				Init_grid();
				
				
				// Create DOM elements for the tools' buttons
				$('<div id="aquarelle_dev"><button type="button" id="button_grid" class="button-light tiny">Grid</button></div>')
				.appendTo('body')
				.on('click', Toggle_grid);
				
				
				// Show the grid if it's his saved state
				if (window.sessionStorage)
				{
					if (sessionStorage.getItem('aquarelle_grid_display') == '1')
					{
						Show_grid();
					}
				}
			}
		);
	}
)(jQuery);


