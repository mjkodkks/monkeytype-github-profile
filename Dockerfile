FROM denoland/deno:1.38.5 as base

# The port that your application listens to.
RUN apt-get -qq update \
    && apt-get -qq install -y --no-install-recommends \
    curl \
    ca-certificates \
    unzip \
# ↓ https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix
# Since I want to leave the contents of troubleshooting.md as it is, ca-certificates is intentionally duplicated here.
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
# ↑ https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix
# ↓ Added based on the information obtained from by console.log(line) at https://deno.land/x/puppeteer@9.0.2/src/deno/BrowserRunner.ts#L168.
    libdrm2 \
    libxkbcommon0 \
    libxshmfence1 \
# ↑ Added based on the information obtained from by console.log(line) at https://deno.land/x/puppeteer@9.0.2/src/deno/BrowserRunner.ts#L168.
    && curl -fsSL https://github.com/denoland/deno/releases/download/v${DENO_VERSION}/deno-x86_64-unknown-linux-gnu.zip \
    --output deno.zip \
    && unzip deno.zip \
    && rm deno.zip \
    && chmod 755 deno \
    && mv deno /usr/bin/deno \
    && apt-get -qq remove --purge -y \
    curl \
# Do not remove ca-certificates as it is required by puppeteer.
#    ca-certificates \
    unzip \
    && apt-get -y -qq autoremove \
    && apt-get -qq clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN chown deno:deno /deno-dir/

ENV DENO_DIR /deno-dir/

EXPOSE 1993

WORKDIR /app

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
# COPY deps.ts .
# RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
COPY . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
# RUN deno cache main.ts

RUN PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts

ENTRYPOINT ["deno"]

# CMD ["PUPPETEER_PRODUCT=chrome", "-A", "--unstable", "https://deno.land/x/puppeteer@16.2.0/install.ts"]
CMD ["run",  "-A",  "--no-check", "--unstable", "main.ts"]