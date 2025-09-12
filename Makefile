.PHONY: install lint pretty format test test-watch coverage dev build ci

install:
	npm ci

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

pretty:
	npx prettier --write .

format: pretty lint-fix

test:
	npm test

coverage:
	npm run test:coverage

dev:
	npm run dev

build:
	npm run build

ci: install format test coverage build