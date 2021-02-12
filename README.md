# OpenAPI Mocker

[![Build Status](https://travis-ci.org/jormaechea/open-api-mocker.svg?branch=master)](https://travis-ci.org/jormaechea/open-api-mocker)
[![Coverage Status](https://coveralls.io/repos/github/jormaechea/open-api-mocker/badge.svg?branch=master)](https://coveralls.io/github/jormaechea/open-api-mocker?branch=master)

An API mocker based in the OpenAPI 3.0 specification.

## Installation and usage

### Using npm

```
npm i -g open-api-mocker

open-api-mocker -s my-schema.json -w

open-api-mocker --help # To prompt every available setting.
```

### Using docker

```
docker run -v "$PWD/myschema.json:/app/schema.json" -p "5000:5000" jormaechea/open-api-mocker
```

Or to run an specific version

```
docker run -v "$PWD/myschema.json:/app/schema.json" -p "5000:5000" jormaechea/open-api-mocker:X.Y.Z`
```

You can set any parameter when running inside a docker container

```
docker run -v "$PWD/myschema.json:/app/schema.json" -p "3000:3000" jormaechea/open-api-mocker:X.Y.Z -s /app/schema.json -p 3000`
```

## Capabilities

- [x] Read yaml and json OpenAPI v3 schemas.
- [x] Port binding selection
- [x] Request parameters validation
- [x] Request body validation
- [x] Response body and headers generation based on examples or schemas
- [x] Response selection using request header: `Prefer: statusCode=XXX` or `Prefer: example=name` 
- [x] Request and response logging
- [x] Servers basepath support
- [ ] API Authentication

## Tests

Simply run `npm t`

## Contributing

Issues and PRs are welcome.
