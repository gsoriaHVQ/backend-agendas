# Usa una imagen oficial de Node.js más ligera
FROM node:18-alpine

# Instala dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

# Crea el directorio de la app
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm ci --only=production && npm cache clean --force

# Copia el resto del código
COPY . .

# Crea usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expone el puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar la app
CMD ["node", "app.js"]# Usa una imagen oficial de Node.js más ligera
FROM node:18-alpine

# Instala dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

# Crea el directorio de la app
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm ci --only=production && npm cache clean --force

# Copia el resto del código
COPY . .

# Crea usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expone el puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar la app
CMD ["node", "app.js"]