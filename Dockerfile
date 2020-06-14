FROM node:13.13.0

RUN apt-get update \
    && curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash \
    && apt-get install git-lfs \
    && git lfs install \
    && npm install -g @vue/cli \
    && npm install -g @vue/cli-init \
