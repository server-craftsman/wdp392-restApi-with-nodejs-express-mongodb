# Cursor IDE Rules for RestAPI Project

This directory contains custom rules and settings for the Cursor IDE that help enforce coding standards, best practices, and detect potential issues in the codebase.

## Rule Sets

The rules are organized into the following categories:

### 1. TypeScript ESLint Rules (`rules/eslint-typescript.json`)
- Basic TypeScript linting rules
- Type safety enforcement
- Interface naming conventions
- Function return type requirements

### 2. Module Structure Rules (`rules/module-structure.json`) 
- Enforces proper naming conventions for services, controllers, and models
- Prevents importing from internal module folders
- Prevents circular dependencies
- Enforces module export patterns

### 3. Code Style Rules (`rules/code-style.json`)
- Consistent indentation (4 spaces)
- Trailing semicolons
- No trailing whitespace
- Single quotes preference
- Import spacing and organization
- Line length limits (240 characters)

### 4. Security Rules (`rules/security.json`)
- Detects hardcoded secrets
- Identifies potential SQL injection vulnerabilities
- Flags insecure JWT implementations
- Ensures proper input validation
- Detects security issues with CORS and cookies

### 5. Performance Rules (`rules/performance.json`)
- Avoids nested promises
- Encourages use of `.lean()` for read-only Mongoose operations
- Detects unnecessary async/await usage
- Identifies inefficient database queries
- Warns about potentially large responses without pagination

## Usage

The rules are automatically loaded by Cursor IDE when opening the project. The main configuration file `.cursor/rules.json` references all the rule sets and provides global settings.

## Settings

Custom editor settings are defined in `.cursor/settings.json` which configures:

- Format on save
- Tab size (4 spaces)
- Maximum line length (240 characters)
- TypeScript preferences
- File associations

## Customization

To modify these rules:

1. Edit the specific rule file in the `.cursor/rules/` directory
2. Adjust severity levels as needed (error, warning, info)
3. Add or remove rules based on project requirements

For more information on Cursor IDE custom rules, refer to the [Cursor Documentation](https://cursor.sh/docs). 