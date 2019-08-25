FROM node:10-alpine

ARG open_api_mocker_version

LABEL version="$open_api_mocker_version"

RUN npm i -g open-api-mocker@${open_api_mocker_version}

WORKDIR /app

EXPOSE 5000

ENTRYPOINT ["open-api-mocker"]

CMD ["-s", "/app/schema.json"]
