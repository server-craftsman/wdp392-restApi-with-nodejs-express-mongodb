## Requirements
- node --version: v20.18.1
- npm --version: 10.8.2
- pnpm --version: 10.10.0
- install node, npm or pnpm
- create file .env with 3 fields:
    - NODE_ENV: development
    - JWT_TOKEN_SECRET: set the secret token as you like
    - PORT: set the port as you like (should be 8080)
    - MONGODB_URI: get the mongoDB uri of the link to your account
    - EMAIL_USER: set email for admin
    - EMAIL_PASSWORD: set email_password for admin
    - DOMAIN_FE: domain default send mail

## Running the project
- pnpm or npm install: install node_modules
- pnpm run dev or npm run dev: run src
- src run API in localhost: http://localhost:8080/ http://localhost:3000

## References
- https://expressjs.com/en/resources/middleware/morgan.html
- https://www.typescriptlang.org/tsconfig/
- https://github.com/winstonjs/winston

### &#169; 2025 Bản quyền thuộc về Nguyễn Đan Huy | fb/danhuyspm