FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --force
RUN VITE_APP_MODE=development pnpm run build --base="/"

FROM nginx:alpine AS final

COPY docker/front/default.conf /etc/nginx/conf.d/

COPY --from=build /app/public/config.local.json /usr/share/nginx/html/config.json
COPY --from=build /app/dist /usr/share/nginx/html