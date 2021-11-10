FROM 412430435138.dkr.ecr.us-west-2.amazonaws.com/portfolio:temp

SHELL [ "/bin/bash", "-l", "-c" ]

# Set Working Directory
WORKDIR /var/www/portfolio

COPY .env /var/www/portfolio/.env
COPY public/mix-manifest.json /var/www/portfolio/public/mix-manifest.json

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash \
    && . ~/.nvm/nvm.sh \
    && nvm --version \
    && nvm install node \
    && export NVM_DIR="$HOME/.nvm" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && node --version && npm --version && npm install \
    && npm run prod