FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install -g pnpm && pnpm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN pnpm run build

FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install -g pnpm

RUN pnpm install --prod

COPY prisma ./prisma

RUN npx prisma@6.8.2 generate

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/convoc-services/main"]
