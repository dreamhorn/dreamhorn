BIN = ./node_modules/.bin
SRC = $(wildcard src/*.coffee)
LIB = $(SRC:src/%.coffee=./%.js)

default:
	doit

watch:
	fswatch --one-per-batch -0 src/ | xargs -0 -n 1 -I {} doit

test: install runtests coverage

runtests:
	$(BIN)/mocha --growl --reporter dot tests

tests/coverage.html: install
	$(BIN)/mocha --require blanket --reporter html-cov tests > tests/coverage.html

coverage: tests/coverage.html

clean:
	rm -f $(LIB)

build: $(LIB)

install link: build
	npm $@

release-patch: build test
	npm version patch

release-minor: build test
	npm version minor

release-major: build test
	npm version major

publish:
	git push --tags origin HEAD:master
	npm publish
