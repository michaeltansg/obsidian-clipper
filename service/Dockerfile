FROM node:20-alpine AS builder

WORKDIR /app

# Install service dependencies
COPY service/package*.json ./service/
RUN cd service && npm ci

# Copy source files (both shared src/ and service/)
COPY src/ ./src/
COPY service/ ./service/

# Build the service
RUN cd service && npm run build

# --- Runtime stage ---
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/service/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/service/dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/index.js"]
