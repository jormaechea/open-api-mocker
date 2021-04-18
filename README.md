# OpenAPI Mocker

![Build Status](https://github.com/jormaechea/open-api-mocker/workflows/build/badge.svg)
[![npm version](https://badge.fury.io/js/open-api-mocker.svg)](https://www.npmjs.com/package/open-api-mocker)
[![Maintainability](https://api.codeclimate.com/v1/badges/79f6eca7ea3f8fe554c2/maintainability)](https://codeclimate.com/github/jormaechea/open-api-mocker/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/79f6eca7ea3f8fe554c2/test_coverage)](https://codeclimate.com/github/jormaechea/open-api-mocker/test_coverage)
[![Docker compatible](https://img.shields.io/badge/docker-compatible-green)](https://hub.docker.com/repository/docker/jormaechea/open-api-mocker)

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
- [x] Support x-faker and x-count extension methods to customise generated responses
- [ ] API Authentication

## Customizing Generated Responses
The OpenAPI specification allows custom properties to be added to an API definition in the form of _x-*_.
OpenAPI Mocker supports the use of two custom extensions to allow data to be randomised which should allow for more
realistic looking data when developing a UI against a mock API for instance.

### x-faker
The _x-faker_ extension is valid for use on properties that have a primitive type (e.g. `string`/`integer`, etc.)
and can be used within an API definition to use one or more methods from the excellent
[faker](https://www.npmjs.com/package/faker) library for generating random data.

Given the following API definition:
```yaml
openapi: '3.0.2'
info:
  title: Cats
  version: '1.0'
servers:
  - url: https://api.cats.test/v1
paths:
  /cat:
    get:
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  firstName:
                    type: string
                    x-faker: name.firstName
                  lastName:
                    type: string
                    x-faker: name.lastName
                  fullName:
                    type: string
                    x-faker: '{{name.firstName}} {{name.lastName}}'
                  age:
                    type: string
                    x-faker: 'random.number({ "min": 1, "max": 20 })'

```

A JSON response similar to the following would be produced:
```JSON
{
    "firstName": "Ted",
    "lastName": "Kozey",
    "fullName": "Herbert Lowe",
    "age": 12
}
```

The _x-faker_ extension accepts values in 3 forms:
1. _fakerNamespace.method_. e.g. `random.uuid`
2. _fakerNamespace.method({ "methodArgs": "in", "json": "format" })_. e.g. `random.number({ "max": 100 })`
3. A mustache template string making use of the 2 forms above. e.g. `My name is {{name.firstName}} {{name.lastName}}`

*NOTE*: To avoid new fake data from being generated on every call, up to 10 responses per endpoint are cached
based on the incoming query string, request body and headers.

### x-count
The _x-count_ extension has effect only when used on an `array` type property.
If encountered, OpenAPI Mocker will return an array with the given number of elements instead of the default of an
array with a single item.

For example, the following API definition:
```yaml
openapi: '3.0.2'
info:
  title: Cats
  version: '1.0'
servers:
  - url: https://api.cats.test/v1
paths:
  /cat:
    get:
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                x-count: 5
                items:
                  type: string
```

Will produce the following response:
```JSON
[
    "string",
    "string",
    "string",
    "string",
    "string"
]
```

## Advanced usage

See the [advanced usage docs](docs/README.md) to extend or build your own app upon OpenAPI Mocker.

## Tests

Simply run `npm t`

## Contributing

Issues and PRs are welcome.
