# 🚀 Express Vercel App

An enterprise-grade Express backend template built with TypeScript, Sequelize/Supabase, Redis, and modular architecture. Designed for deployment on [Vercel](https://vercel.com), with support for MySQL, PostgreSQL, Supabase, and OTP/email authentication.

---

## 📦 Tech Stack

- **Runtime**: Node.js / pnpm
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL / PostgreSQL / Supabase
- **ORM**: Sequelize, drizzle-orm
- **Cache**: Redis (via Upstash)
- **Auth**: JWT, OTP via Nodemailer
- **Templating**: EJS
- **Validation**: Zod
- **Deployment**: Vercel

---

## 🛠️ Project Setup

### 1. Create Project Folder

```bash
mkdir express-vercel-app && cd express-vercel-app
pnpm init
```

### create a src folder

mkdir src && cd src
echo.> app.ts && echo.> server.ts
cd ..

### install core dependencies

```
pnpm add express dotenv@16.5.0 zod uuid bcryptjs compression cookie-parser cors helmet morgan express-rate-limit request-ip express-async-errors
```

### install dev dependencies

```
pnpm add --save-dev rimraf prettier tsx typescript
```

### Install Type Definitions

```
pnpm add --save-dev @types/node @vercel/node @types/express @types/cors @types/request-ip @types/compression @types/cookie-parser @types/morgan
```

### create a .env file

cp .env.example .env

### create a .gitignore file

cp .gitignore.example .gitignore

---

### prettier config in .prettierrc

```
{
  "singleQuote": false,
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### swagger ui

```
pnpm add swagger-ui-express

```

## 🚀 Getting Started.
