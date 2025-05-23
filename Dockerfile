# Build aşaması
FROM node:18-alpine as build

# Çalışma dizinini ayarla
WORKDIR /app

# Bağımlılıkları kopyala
COPY package.json package-lock.json vite.config.js ./

# Bağımlılıkları yükle
RUN npm ci

# Proje dosyalarını kopyala
COPY . .

# Projeyi derle
RUN npm run build

# Çalışma aşaması - üretim modu
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Sadece gerekli dosyaları kopyala
COPY --from=build /app/package.json /app/package-lock.json /app/vite.config.js ./
COPY --from=build /app/dist ./dist

# Preview için gerekli olan tüm bağımlılıkları yükle (development dependencies dahil)
RUN npm ci

# Vite preview için portu aç (varsayılan port 4173)
EXPOSE 4173

# Uygulamayı başlat
CMD ["npm", "run", "preview"] 