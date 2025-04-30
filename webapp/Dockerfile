FROM node:22

WORKDIR /app
COPY . .

RUN npm install

# Declarar los argumentos de build
ARG REACT_APP_API_ENDPOINT
ARG REACT_APP_API_REST_ENDPOINT
ARG REACT_APP_LLM_API_KEY

# Exponerlos como variables de entorno para usarlos en el build
ENV REACT_APP_API_ENDPOINT=${REACT_APP_API_ENDPOINT}
ENV REACT_APP_API_REST_ENDPOINT=${REACT_APP_API_REST_ENDPOINT}
ENV REACT_APP_LLM_API_KEY=${REACT_APP_LLM_API_KEY}

# Compilar la app con los valores inyectados
RUN npm run build

RUN npm install serve
CMD ["npm", "run", "prod"]
