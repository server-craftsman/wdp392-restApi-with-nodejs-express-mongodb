
# Node.js API Starter with TypeScript, PNPM, MongoDB

![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen?logo=node.js)
![PNPM](https://img.shields.io/badge/PNPM-10.x-orange?logo=pnpm)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Connected-success?logo=mongodb)

---

## Requirements

- `node --version`: **v20.18.1**
- `npm --version`: **10.8.2**
- `pnpm --version`: **10.10.0**

---

## Installation

1. **Install Node.js, NPM and PNPM** if not already:
    ```bash
    # Node & npm
    https://nodejs.org/

    # pnpm
    npm install -g pnpm
    ```

2. **Create a `.env` file** in the project root with the following fields:

    ```env
    - NODE_ENV: development
    - JWT_TOKEN_SECRET: set the secret token as you like
    - PORT: set the port as you like (should be 8080)
    - MONGODB_URI: get the mongoDB uri of the link to your account
    - EMAIL_USER: set email for admin
    - EMAIL_PASSWORD: set email_password for admin
    - DOMAIN_FE: domain default send mail
    ```

---

## Running the Project

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

> Or if using npm:

```bash
npm install
npm run dev
```

The backend API runs on:

- `http://localhost:8080/`
- (Optional) Frontend or client: `http://localhost:3000/`

---

## 📚 References

- [Morgan middleware (Logging)](https://expressjs.com/en/resources/middleware/morgan.html)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig/)
- [Winston Logger](https://github.com/winstonjs/winston)

---

### © 2025 Bản quyền thuộc về Nguyễn Đan Huy | [fb/danhuyspm](https://facebook.com/danhuyspm)
test
