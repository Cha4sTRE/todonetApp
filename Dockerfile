# ========================================
# 1️⃣ Etapa de construcción (Build)
# ========================================
FROM node:22-alpine AS build

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias
COPY package.*json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Compilar la aplicación Angular para producción
RUN npm run build -- --configuration production

# ========================================
# 2️⃣ Etapa de despliegue (Nginx)
# ========================================
FROM nginx:stable-alpine

# Eliminar configuración por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos generados de Angular al directorio de Nginx
COPY --from=build /app/dist/todonetApp/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
