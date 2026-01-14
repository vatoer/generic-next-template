# Installation 

## Prisma 

https://www.prisma.io/docs/guides/nextjs

```sh
pnpm add prisma tsx @types/pg --save-dev
pnpm add @prisma/client @prisma/adapter-pg dotenv pg
pnpm dlx prisma init --db --output ../src/generated/prisma
```