# Servidores autohospedados: señalización WebRTC (1.3) y almacenamiento (7.2)
# node:22 requerido por node:sqlite (base de datos local sin dependencias)
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY signaling-server.mjs storage-server.mjs ./
# Directorio de datos del almacenamiento (7.2), escribible por el usuario node
RUN mkdir -p /data && chown node:node /data
EXPOSE 3001 3003
USER node
CMD ["node", "signaling-server.mjs"]
