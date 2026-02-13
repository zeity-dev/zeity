# base stage
FROM node:24.13.1-alpine AS node-alpine

RUN apk update --no-cache && \
    apk upgrade && \
    apk cache clean && \
    rm -rf /var/cache/apk/*

# builder stage
FROM node-alpine AS builder

ENV NODE_ENV=production
WORKDIR /home/node/
COPY --chown=node:node ./ /home/node/

RUN corepack enable

USER node

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install && \
    pnpm cache delete
RUN pnpm --filter ./apps/zeity build

# prod stage
FROM node-alpine AS prod

ENV MIGRATIONS_PATH=./app/database/migrations
USER node
WORKDIR /home/node/

RUN mkdir -p /home/node/app

COPY --from=builder --chown=node:node /home/node/apps/zeity/.output ./app
COPY --from=builder --chown=node:node /home/node/apps/zeity/server/database/migrations $MIGRATIONS_PATH


EXPOSE 3000
CMD [ "node", "/home/node/app/server/index.mjs" ]