.PHONY: build ci fmt fmt-check lint test

FILES_TO_FORMAT = ./src ./deps.ts ./mod.ts ./version.ts

build:
	@deno run --unstable -A mod.ts

ci:
	@make fmt-check
	@make lint
	@make build
	@make test

fmt:
	@deno fmt $(FILES_TO_FORMAT)

fmt-check:
	@deno fmt --check $(FILES_TO_FORMAT)

lint:
	@deno lint --unstable $(FILES_TO_FORMAT)

test:
	@deno test --allow-read --allow-write --allow-net --allow-run --allow-env --unstable ./src
