# =========================
# === 1. DEVELOPMENT    ===
# =========================
FROM rustlang/rust:nightly-bookworm AS development

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Cache dependencies
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build
RUN rm -rf src

# Copy real code
COPY . .

# Default command for dev (override if needed)
CMD ["cargo", "run"]

# =========================
# === 2. BUILD STAGE    ===
# =========================
FROM development AS build

# Build optimized binary
RUN cargo build --release



# =========================
# === 3. PRODUCTION     ===
# === (same base env)   ===
# =========================
FROM development AS production

# Remove dev temp files
RUN rm -rf target/debug

# Copy built binary from build stage
COPY --from=build /app/target/release/mailer_service /app/mailer_service

# Optional: drop cargo sources to slim image a bit
RUN rm -rf src .cargo Cargo.toml Cargo.lock

WORKDIR /app

ENV RUST_LOG=info
ENV PORT=9090

EXPOSE 9090

CMD ["./mailer_service"]
