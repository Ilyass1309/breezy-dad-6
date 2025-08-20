# Crée le dossier de logs pour éviter l'erreur ENOENT
RUN mkdir -p /home/logs/auth-service
FROM  node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "index.js" ]