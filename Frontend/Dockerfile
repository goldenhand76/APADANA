FROM node:16-alpine as build

# https://github.com/npm/npm/issues/8836#issuecomment-132302605
# https://github.com/jstandish/cached-node-module-build-example/blob/567a8537d6b8c935d9e4dee2267b24f93bcecfa3/Dockerfile
WORKDIR /tmp
ADD package.json /tmp/
RUN npm install -g npm@8.19.4 --force
RUN npm config set loglevel verbose
RUN npm config rm proxy
RUN npm config rm https-proxy
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --legacy-peer-deps

WORKDIR /app/frontend
RUN cp -a /tmp/node_modules /app/frontend

COPY ./ ./
RUN npm run build

FROM nginx:latest
COPY --from=build /app/frontend/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]