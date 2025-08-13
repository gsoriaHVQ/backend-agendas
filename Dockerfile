# Usa una imagen oficial de Node.js
FROM node:18

# Crea el directorio de la app
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto (ajusta si usas otro)
EXPOSE 3001

# Comando para iniciar la app
CMD ["node", "app.js"]