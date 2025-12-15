FROM node:22-slim AS base
ARG BASE_PATH="/"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV BASE_PATH=$BASE_PATH
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --force
RUN VITE_APP_MODE=production pnpm run build --base=$BASE_PATH

FROM nginx:alpine AS final

COPY docker/default.conf /etc/nginx/conf.d/

COPY --from=build /app/public/config.local.json /usr/share/nginx/html/config.json
COPY --from=build /app/dist /usr/share/nginx/html

# Add startup script
COPY /docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]