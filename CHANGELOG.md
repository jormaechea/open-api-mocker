# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.11.1] - 2022-02-20
### Fixed
- Responses that are just a number are now properly generated (#56)

## [1.11.0] - 2021-12-23
### Added
- Faker locale validation to avoid setting an invalid locale

### Fixed
- Locales without country modifier now work properly (solves docker error with faker) (#55)

## [1.10.0] - 2021-12-22
### Added
- `null` examples are now allowed and used for response generation (#49)

## [1.9.0] - 2021-12-20
### Added
- Response handling for different mime types (#48)

### Changed
- Now `x-faker` extension takes precedence in response generation (#53)

### Fixed
- Faker now locale selection now works as expected (#50, #54)

## [1.8.0] - 2021-10-10
### Changed
- Now responses with enums pick a random element from the `enum` array
- Now JSON request bodies can handle up to 10mb

### Fixed
- Dependencies updated to fix vulnerabilities

## [1.7.2] - 2021-06-27
### Fixed
- In some cases `oneOf`, `anyOf` and `allOf` schemas reported an error that wasn't real. This doesn't happen any more
- Response handling had an error since last release, which has now been fixed.

## [1.7.1] - 2021-06-22
### Fixed
- Response header `x-powered-by` has now the correct value
- Schema Object `pattern` property can be passed as a string (#35)
- Refactor to improve code quality and maintainability (#37)
- Schemas with `oneOf`, `anyOf` and `allOf` now work properly and don't get wrong default values injected (#41)
- Dependencies updated to fix vulnerabilities

## [1.7.0] - 2021-04-20
### Added
- `quiet` (alias `q`) option to avoid printing every request and response (#24)
- CLI: force-quit implemented by pressing `ctrl+c` twice
- Added support for custom Server implementation for programmatic usage (#22)
- Added support for custom Schema loader implementation for programmatic usage (#27)
- Added advanced usage docs

### Changed
- Schema loading and watch feature moved out of CLI layer

### Fixed
- Updated dependencies to fix vulnerabilities
- Huge refactor to improve code quality and separation of concerns (#26, #27)

## [1.6.0] - 2021-03-23
### Added
- `x-faker` extension is now supported for response generation
- `x-count` extension is now supported for responses with array types
- Added support for more formats defined in the OpenAPI specs

### Changed
- Unknown formats don't throw errors any more

### Fixed
- `Prefer` header with statusCode now works properly again
- Git hooks are now run again with `husky@4`
- Tests now run properly when local timezone is not UTC

## [1.5.1] - 2021-02-12
### Fixed
- Removed CI/CD for node 8

## [1.5.0] - 2021-02-12
### Added
- Support for response section when `examples` property is present using `Prefer` header
- Support for more content-types: `application/x-www-form-urlencoded`, `text/plain` and `application/octet-stream`

### Fixed
- Dependencies update

## [1.4.2] - 2021-01-26
### Fixed
- Fixed exclusiveMinimum and exclusiveMaximum validation

## [1.4.1] - 2020-10-01
### Fixed
- Changed YAML parsing library for better support (#10)

## [1.4.0] - 2020-07-03
### Added
- Added support for path level parameters (#8)

### Fixed
- Path objects are now correctly as they can have extra standard and extended properties (#8)

## [1.3.1] - 2020-04-25
### Fixed
- Support for every 3.x.x specification version (#6)

## [1.3.0] - 2020-04-05
### Added
- Support for strings in schemas with format `"password"`

### Fixed
- Empty response bodies are now handled properly

## [1.2.5] - 2020-03-26
### Fixed
- Path parameters with underscores are now parsed correctly
- Paths with multiple parameters are now handled properly

## [1.2.4] - 2020-02-10
### Fixed
- Added credentials in CORS configuration

## [1.2.3] - 2020-02-09
### Fixed
- Travis deploy config fixed

## [1.2.2] - 2020-02-09
### Fixed
- OpenAPI naming standarized
- Usage documentation improved

## [1.2.1] - 2019-12-30
### Fixed
- Fix in header validation for case insensitive

## [1.2.0] - 2019-12-30
### Added
- Added option to watch schema changes

## [1.1.4] - 2019-12-30
### Fixed
- CORS configuration improved

## [1.1.3] - 2019-09-07
### Added
- Package json repository links

### Fixed
- Security issues with dependencies

## [1.1.2] - 2019-08-25
### Added
- `latest` docker image tag is now generated

### Fixed
- SIGINT handle improved
- NotFound response uris fixed

## [1.1.1] - 2019-08-25
### Fixed
- Deployment dependencies fixed

## [1.1.0] - 2019-08-25
### Added
- Installation using npm in README
- Npm and docker releases
- SIGINT handling
