BIN = ./node_modules/.bin
SRC = $(wildcard src/*.coffee)
LIB = $(SRC:src/%.coffee=./%.js)

build: $(LIB)

%.js: src/%.coffee
	mkdir -p $(@D)
	$(BIN)/coffee --compile --print --map $< > $@

test: install
	$(BIN)/mocha tests
	make coverage

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
