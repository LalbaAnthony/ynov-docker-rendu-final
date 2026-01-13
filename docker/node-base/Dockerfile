# Fully customized Node.js base image on Debian 12 slim
# Kinda useless since official Node.js images are already optimized
# But we're here to have fun sooo

FROM debian:12-slim

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22.x from NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && node -v \
    && npm -v

# Create non-root user for running the app
RUN useradd -m nodeuser

# Create app dir and give ownership
RUN mkdir -p /app && chown -R nodeuser:nodeuser /app

# Set working directory, use `app` since most Node.js apps use that
WORKDIR /app

USER nodeuser
