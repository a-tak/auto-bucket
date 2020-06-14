FROM node:13.13.0

RUN npm install -g @vue/cli
RUN npm install -g @vue/cli-init
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash
RUN apt-get install git-lfs
RUN git lfs install