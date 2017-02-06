# Makefile for kjPoker game
#
# Targets:
#
# make all     # create all files
#
# make test    # create all files and launch unit tests in browser
#
# make launch  # create all files and launch app in browser
#
# make clean   # delete all generated files

SED=sed
JAVA=java
MINIFY_CSS=$(JAVA) -jar yuicompressor-2.4.2.jar
MINIFY_JS=$(JAVA) -jar compiler.jar
OPENBROWSER=open -a /Applications/Safari.app
GETTIMESTAMP=/bin/date -u '+%FT%TZ'

# Minified JavaScript
MINJSFILES=js/kjUtil-min.js js/kjPoker-min.js js/kjPokerUI-min.js

# Minified CSS
MINCSSFILES=css/reset-min.css css/kjPoker-min.css

MINFILES=$(MINJSFILES) $(MINCSSFILES)

# HTML files that use unminified JavaScript and CSS
NOMINFILES=kjPoker-nomin.html kjPokerTests-nomin.html

# Files to be listed in kjPoker.manifest
CACHEMANIFESTFILES=\
favicon.ico \
favicon.png \
apple-touch-icon.png \
css/kjPoker-min.css \
css/reset-min.css \
js/jquery.js \
js/json2.js \
js/kjUtil-min.js \
js/kjPoker-min.js \
js/kjPokerUI-min.js \
images/background.png \
images/JacksOrBetterIcon.png \
images/card/2c.png \
images/card/2d.png \
images/card/2h.png \
images/card/2s.png \
images/card/3c.png \
images/card/3d.png \
images/card/3h.png \
images/card/3s.png \
images/card/4c.png \
images/card/4d.png \
images/card/4h.png \
images/card/4s.png \
images/card/5c.png \
images/card/5d.png \
images/card/5h.png \
images/card/5s.png \
images/card/6c.png \
images/card/6d.png \
images/card/6h.png \
images/card/6s.png \
images/card/7c.png \
images/card/7d.png \
images/card/7h.png \
images/card/7s.png \
images/card/8c.png \
images/card/8d.png \
images/card/8h.png \
images/card/8s.png \
images/card/9c.png \
images/card/9d.png \
images/card/9h.png \
images/card/9s.png \
images/card/ac.png \
images/card/ad.png \
images/card/ah.png \
images/card/as.png \
images/card/back.png \
images/card/jb.png \
images/card/jc.png \
images/card/jd.png \
images/card/jh.png \
images/card/jr.png \
images/card/js.png \
images/card/kc.png \
images/card/kd.png \
images/card/kh.png \
images/card/ks.png \
images/card/qc.png \
images/card/qd.png \
images/card/qh.png \
images/card/qs.png \
images/card/tc.png \
images/card/td.png \
images/card/th.png \
images/card/ts.png

# All generated files
GENERATEDFILES=$(MINFILES) $(NOMINFILES) kjPoker.manifest

.PHONY: all
all: $(GENERATEDFILES)

.PHONY: test
test: $(GENERATEDFILES)
	$(OPENBROWSER) kjPokerTests.html

.PHONY: test-nomin
test-nomin: kjPokerTests-nomin.html
	$(OPENBROWSER) kjPokerTests-nomin.html

.PHONY: launch
launch: $(GENERATEDFILES)
	$(OPENBROWSER) kjPoker.html

.PHONY: launch-nomin
launch-nomin: kjPoker-nomin.html
	$(OPENBROWSER) kjPoker-nomin.html

.PHONY: clean
clean:
	$(RM) $(GENERATEDFILES)

kjPoker.manifest: $(CACHEMANIFESTFILES)
	echo "CACHE MANIFEST" >kjPoker.manifest
	echo "# `/bin/date -u '+%FT%TZ'`" >>kjPoker.manifest
	for f in $(CACHEMANIFESTFILES); do echo $$f >>kjPoker.manifest; done

js/kjUtil-min.js: js/kjUtil.js
	$(MINIFY_JS) <js/kjUtil.js >js/kjUtil-min.js

js/kjPoker-min.js: js/kjPoker.js
	$(MINIFY_JS) <js/kjPoker.js >js/kjPoker-min.js

js/kjPokerUI-min.js: js/kjPokerUI.js
	$(MINIFY_JS) <js/kjPokerUI.js >js/kjPokerUI-min.js

css/reset-min.css: css/reset.css
	$(MINIFY_CSS) css/reset.css >css/reset-min.css

css/kjPoker-min.css: css/kjPoker.css
	$(MINIFY_CSS) css/kjPoker.css >css/kjPoker-min.css

kjPoker-nomin.html: kjPoker.html
	$(SED) -e 's/-min//g' kjPoker.html >kjPoker-nomin.html

kjPokerTests-nomin.html: kjPokerTests.html
	$(SED) -e 's/-min//g' kjPokerTests.html >kjPokerTests-nomin.html

