FROM node:18-bullseye

EXPOSE 3000

WORKDIR /workspaces/tibia-loot-manager

RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*