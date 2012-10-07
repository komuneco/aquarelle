#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Aquarelle, The creative & opensource CSS framework.
# Copyright (C) 2012 Floris MORICEAU <floris.moriceau@komuneco.org> and Guillaume AMAT <guillaume.amat@komuneco.org>

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.




import os
import sys
import re
import signal




signal.signal(signal.SIGINT,	signal.SIG_DFL)
signal.signal(signal.SIGUSR1,	signal.SIG_DFL)



tab_css_files		= ['reset', 'grid', 'boxes', 'forms', 'tables', 'typography', 'menu', 'media', 'icons', 'iab', 'tricks', 'print', 'ie', 'dev']
tab_themes			= ['default', 'default-dark']
css_content_core	= ''
css_content_ie		= ''
css_content_print	= ''
css_content_themes	= {}
js_content_core		= ''
js_content_dev		= ''

gpl_license = '''/*
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

'''



try:
	path = os.path.split(os.path.realpath(os.path.dirname(__file__)))[0]
except NameError:
	path = os.path.realpath(sys.path[0])


if path != '':
	os.chdir(path)
	sys.path.append(path)






try:
	os.mkdir('build/tmp')
except OSError:
	print 'Erreur lors de la creation du repertoire temporaire build/tmp/'







for css_file in tab_css_files:
	try:
		f = open('src/css/'+ css_file +'.css')
		css_content_core += f.read()
		f.close()
	except IOError:
		print 'Erreur lors de la lecture de src/css/'+ css_file +'.css'

try:
	f = open('src/lib/jquery-powertip/jquery.powertip.css')
	css_content_core += f.read()
	f.close()
except IOError:
	print 'Erreur lors de la lecture de src/lib/jquery-powertip/jquery.powertip.css'

for theme in tab_themes:
	try:
		f = open('src/css/themes/'+ theme +'.css')
		css_content_themes[theme] = f.read()
		f.close()
	except IOError:
		print 'Erreur lors de la lecture de css/themes/'+ theme +'.css'








try:
	f = open('build/tmp/aquarelle.css', 'w')
	f.write(css_content_core)
	f.close()
except IOError:
	print 'Erreur lors de la creation du fichier temporaire build/tmp/aquarelle.css'

for theme in tab_themes:
	try:
		f = open('build/tmp/'+ theme +'.aquarelle.css', 'w')
		f.write(css_content_core)
		f.write(css_content_themes[theme])
		f.close()
	except IOError:
		print 'Erreur lors de la creation du fichier temporaire build/tmp/'+ theme +'.aquarelle.css'






os.system('java -jar build/yuicompressor-2.4.6.jar --charset utf-8 --type css -o css/aquarelle.min.css build/tmp/aquarelle.css')

for theme in tab_themes:
	os.system('java -jar build/yuicompressor-2.4.6.jar --charset utf-8 --type css -o css/'+ theme +'.aquarelle.min.css build/tmp/'+ theme +'.aquarelle.css')


try:
	f = open('css/aquarelle.min.css', 'r')
	old_content = f.read()
	f.close()
	f = open('css/aquarelle.min.css', 'w')
	f.write(gpl_license + old_content)
	f.close()
except IOError:
	print 'Erreur lors de la mise en place de la licence dans le fichier css/aquarelle.min.css'

for theme in tab_themes:
	try:
		f = open('css/'+ theme +'.aquarelle.min.css', 'r')
		old_content = f.read()
		f.close()
		f = open('css/'+ theme +'.aquarelle.min.css', 'w')
		f.write(gpl_license + old_content)
		f.close()
	except IOError:
		print 'Erreur lors de la mise en place de la licence dans le fichier css/'+ theme +'.aquarelle.min.css'




try:
	os.remove('build/tmp/aquarelle.css')
except OSError:
	print 'Erreur lors de la suppression du fichier temporaire build/tmp/aquarelle.css'

for theme in tab_themes:
	try:
		os.remove('build/tmp/'+ theme +'.aquarelle.css')
	except OSError:
		print 'Erreur lors de la suppression du fichier temporaire build/tmp/'+ theme +'.css'








try:
	f = open('src/js/aquarelle.js')
	js_content_core += f.read()
	f.close()
except IOError:
	print 'Erreur lors de la lecture de src/js/aquarelle.js'

try:
	f = open('src/lib/jquery-powertip/jquery.powertip.js')
	js_content_core += f.read()
	f.close()
except IOError:
	print 'Erreur lors de la lecture de src/lib/jquery-powertip/jquery.powertip.js'

try:
	f = open('src/js/dev.js')
	js_content_dev += f.read()
	f.close()
except IOError:
	print 'Erreur lors de la lecture de src/js/dev.js'


try:
	f = open('build/tmp/aquarelle.js', 'w')
	f.write(js_content_core)
	f.close()
except IOError:
	print 'Erreur lors de la creation du fichier temporaire build/tmp/aquarelle.js'

try:
	f = open('build/tmp/dev.aquarelle.js', 'w')
	f.write(js_content_core)
	f.write(js_content_dev)
	f.close()
except IOError:
	print 'Erreur lors de la creation du fichier temporaire build/tmp/dev.aquarelle.js'





os.system('java -jar build/yuicompressor-2.4.6.jar --charset utf-8 --type js -o js/aquarelle.min.js build/tmp/aquarelle.js')
os.system('java -jar build/yuicompressor-2.4.6.jar --charset utf-8 --type js -o js/dev.aquarelle.min.js build/tmp/dev.aquarelle.js')


try:
	f = open('js/aquarelle.min.js', 'r')
	old_content = f.read()
	f.close()
	f = open('js/aquarelle.min.js', 'w')
	f.write(gpl_license + old_content)
	f.close()
except IOError:
	print 'Erreur lors de la mise en place de la licence dans le fichier js/aquarelle.min.js'

try:
	f = open('js/dev.aquarelle.min.js', 'r')
	old_content = f.read()
	f.close()
	f = open('js/dev.aquarelle.min.js', 'w')
	f.write(gpl_license + old_content)
	f.close()
except IOError:
	print 'Erreur lors de la mise en place de la licence dans le fichier js/dev.aquarelle.min.js'





try:
	os.remove('build/tmp/aquarelle.js')
except OSError:
	print 'Erreur lors de la suppression du fichier temporaire build/tmp/aquarelle.js'

try:
	os.remove('build/tmp/dev.aquarelle.js')
except OSError:
	print 'Erreur lors de la suppression du fichier temporaire build/tmp/aquarelle.js'


try:
	os.rmdir('build/tmp')
except OSError:
	print 'Erreur lors de la suppression du dossier temporaire build/tmp/'



