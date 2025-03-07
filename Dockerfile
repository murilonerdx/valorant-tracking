# Etapa de build
FROM node:18 AS builder
WORKDIR /app

# Copiar arquivos necessários para o build
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Gerar build do front-end
RUN npm run build

# Etapa de produção com NGINX
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copiar arquivos gerados do build
COPY --from=builder /app/dist .

# Copiar o arquivo de configuração do NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 8888

# Comando padrão para iniciar o NGINX
CMD ["nginx", "-g", "daemon off;"]
