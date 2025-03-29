FROM node:22

# Crear directorio de trabajo
WORKDIR /app

# Copiar código fuente
COPY . .

# Instalar dependencias
RUN npm install

# Declarar los argumentos de build
ARG REACT_APP_API_ENDPOINT
ARG REACT_APP_LLM_API_KEY

# Exponerlos como variables de entorno para usarlos en el build
ENV REACT_APP_API_ENDPOINT=${REACT_APP_API_ENDPOINT}
ENV REACT_APP_LLM_API_KEY=${REACT_APP_LLM_API_KEY}

# Compilar la app con los valores inyectados
RUN npm run build

# Instalar servidor estático para servir la app
RUN npm install serve

# Comando de arranque
CMD ["npm", "run", "prod"]
