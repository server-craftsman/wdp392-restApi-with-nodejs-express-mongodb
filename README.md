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

## Code Quality Tools

### ESLint Rules

This project uses ESLint to enforce code quality and maintain consistent coding standards. The rules are specifically configured for the `src` directory with special configurations for different module types.

To run the linter:
```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors automatically
```

### Key Linting Rules

- **TypeScript Safety**: Strict type checking with no `any` type allowed
- **Module Structure**: Enforced import ordering and module boundaries
- **Naming Conventions**: 
  - Interfaces must start with `I` and use PascalCase
  - Models must follow PascalCase
  - Type aliases must use PascalCase
- **Code Organization**: Different rules for controllers, services, routes, and models

### Prettier

Code formatting is handled by Prettier. To format your code:
```bash
npm run format       # Format all TypeScript files
npm run format:check # Check formatting without changing files
```

### Pre-commit Hooks

This project uses Husky and lint-staged to run linters and formatters before each commit, ensuring that only quality code is committed to the repository

### © 2025 Bản quyền thuộc về Nguyễn Đan Huy | [fb/danhuyspm](https://facebook.com/danhuyspm)