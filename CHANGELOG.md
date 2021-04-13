# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Support empty response.
- `quiet` (alias `q`) option to avoid printing every request and response

### Fixed
- Updated dependencies to fix vulnerabilities

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
