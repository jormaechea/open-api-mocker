# Open API Mocker

[![Build Status](https://travis-ci.org/jormaechea/open-api-mocker.svg?branch=master)](https://travis-ci.org/jormaechea/open-api-mocker)
[![Coverage Status](https://coveralls.io/repos/github/jormaechea/open-api-mocker/badge.svg?branch=master)](https://coveralls.io/github/jormaechea/open-api-mocker?branch=master)

An API mocker based in the Open API 3.0 specification.

## Installation

**Soon**, install globally `npm i -g open-api-mocker`

**Soon**, there will be a dockerized version available.

## Usage

Just run `open-api-mocker` in your console, and every available setting will be prompted.

## Capabilities

- [x] Read yaml and json open api v3 schemas.
- [x] Port binding selection
- [x] Request parameters validation
- [ ] Request body validation *(Currently, it only supports basic request body validation: required body and shallow type check))*
- [x] Response body and headers generation based on examples or schemas
- [x] Response selection based using `Prefer: statusCode=XXX` request header.
- [x] Request and response logging
- [x] Servers basepath support
- [ ] API Authentication

## Tests

Simply run `npm t`

## Contributing

Issues and PRs are welcome.
