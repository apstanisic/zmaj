FROM node:18
WORKDIR /app

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
COPY pnpm-lock.yaml ./

RUN pnpm fetch --prod

ADD . ./
RUN pnpm install -r --offline --prod


EXPOSE 5000

CMD [ "npm", "run", "start-docker-project" ]
