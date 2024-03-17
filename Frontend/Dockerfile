FROM node:16-alpine as build

WORKDIR /app/frontend
COPY ./package.json ./
RUN npm install --force
COPY ./ ./
RUN npm run build

FROM nginx:latest
COPY --from=build /app/frontend/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]