# Usa una imagen oficial de Node (alpine para ser ligero)
FROM node:18-alpine

# Define el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de dependencias y luego instala
COPY package*.json ./
RUN npm install

# Copia el resto del código de tu proyecto
COPY . .

# Expone los puertos que usa Expo (por defecto 19000, 19001, 19002)
EXPOSE 19000 19001 19002

# Comando para iniciar Expo en modo tunnel (útil para conexiones desde móvil)
CMD ["npx", "expo", "start", "--tunnel"]
