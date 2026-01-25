FROM node:22-bookworm-slim as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ENV NODE_ENV production
RUN apt-get update
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# -----

# FROM base as deps
# WORKDIR /app
# ADD package.json pnpm-lock.yaml .npmrc ./
# RUN pnpm install --frozen-lockfiles

# FROM base as production-deps
# WORKDIR /app
# COPY --from=deps /app/node_modules /app/node_modules
# ADD package.json pnpm-lock.yaml .npmrc ./
# RUN pnpm prune --prod

# FROM base as build
# ARG COMMIT_SHA
# ENV COMMIT_SHA=$COMMIT_SHA
# WORKDIR /app
# COPY --from=deps /app/node_modules /app/node_modules
# ADD . .
# RUN pnpm run build

FROM caddy:2.9.1 AS runtime
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 80
