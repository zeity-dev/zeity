FROM node:24.13.1

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
    nano \
    zsh \
    git \
    && \
    apt-get clean autoclean && \
    apt-get autoremove --yes && \
    rm -rf /var/lib/{apt,dpkg,cache,log}

# Install Oh My Zsh
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true
RUN zsh -c 'git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions'
RUN zsh -c 'git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting'

ENV PNPM_HOME=/workspaces/pnpm
RUN corepack enable pnpm

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/zsh
ENV EDITOR=nano
ENV VISUAL=nano
