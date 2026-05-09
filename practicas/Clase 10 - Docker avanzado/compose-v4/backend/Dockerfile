FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src

FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache wget
COPY --from=builder /app /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["npm", "start"]
