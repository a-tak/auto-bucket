FROM node:16-bullseye

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    git \
    && curl -fsSL https://packagecloud.io/github/git-lfs/gpgkey | gpg --dearmor -o /usr/share/keyrings/git-lfs-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/git-lfs-archive-keyring.gpg] https://packagecloud.io/github/git-lfs/debian $(lsb_release -cs) main" > /etc/apt/sources.list.d/git-lfs.list \
    && apt-get update \
    && apt-get install -y git-lfs \
    && git lfs install \
    && npm install -g @vue/cli \
    && npm install -g @vue/cli-init

# コピーしてpostCreateCommand.shを実行可能にする
COPY postCreateCommand.sh /workspace/
RUN chmod +x /workspace/postCreateCommand.sh
