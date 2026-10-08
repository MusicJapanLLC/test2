FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY service.js server.js ./
RUN mkdir /data && chown node:node /data
USER node
ENV HOST=0.0.0.0 PORT=4242 DATABASE_PATH=/data/payments.sqlite
EXPOSE 4242
CMD ["node", "server.js"]
