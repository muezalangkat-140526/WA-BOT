FROM node:20-alpine

# Pasang dependensi dasar untuk build & timezone
RUN apk add --no-cache tzdata

ENV TZ=Asia/Jakarta
WORKDIR /app

# Salin package.json dan instal dependensi produksi
COPY package*.json ./
RUN npm install --omit=dev

# Salin kode sumber
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY README.md ./

# Folder sesi WhatsApp wajib dijadikan volume persisten agar tidak hilang saat container restart
VOLUME ["/app/auth_info_baileys"]

CMD ["npm", "start"]
