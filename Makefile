BIN = ./node_modules/.bin
SRC = $(wildcard src/*.coffee)
LIB = $(SRC:src/%.coffee=./%.js)

default:
	doit

watch:
	fswatch --one-per-batch -0 src/ | xargs -0 -n 1 -I {} doit

test: install runtests coverage

runtests:
	$(BIN)/mocha tests

tests/coverage.html: install
	$(BIN)/mocha --require blanket -R html-cov tests > tests/coverage.html

coverage: tests/coverage.html

clean:
	rm -f $(LIB)

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
