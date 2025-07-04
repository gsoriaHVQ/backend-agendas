# Dockerfile para backend-agendas (Node.js + OracleDB)
FROM node:22

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto (ajusta si usas otro)
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
