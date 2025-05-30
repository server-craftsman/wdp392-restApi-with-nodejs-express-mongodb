module.exports = {
    extends: '../.eslintrc',
    rules: {
        // Enforce specific imports ordering for clarity
        'import/order': [
            'error',
            {
                'groups': [
                    'builtin',
                    'external',
                    'internal',
                    ['parent', 'sibling'],
                    'index'
                ],
                'pathGroups': [
                    {
                        'pattern': 'core/**',
                        'group': 'internal',
                        'position': 'before'
                    },
                    {
                        'pattern': 'modules/**',
                        'group': 'internal',
                        'position': 'after'
                    },
                    {
                        'pattern': 'types/**',
                        'group': 'internal',
                        'position': 'after'
                    }
                ],
                'pathGroupsExcludedImportTypes': ['builtin'],
                'newlines-between': 'always',
                'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
            }
        ],

        // Enforce module boundaries
        'no-restricted-imports': [
            'error',
            {
                'patterns': [
                    {
                        'group': ['modules/*/internal'],
                        'message': 'Do not import from internal module folders. Use the public API.'
                    }
                ]
            }
        ],

        // Enforce return types for controllers and services
        '@typescript-eslint/explicit-function-return-type': [
            'error',
            {
                'allowExpressions': true,
                'allowTypedFunctionExpressions': true
            }
        ],

        // Enforce consistent model naming
        '@typescript-eslint/naming-convention': [
            'error',
            {
                'selector': 'interface',
                'format': ['PascalCase'],
                'prefix': ['I']
            },
            {
                'selector': 'typeAlias',
                'format': ['PascalCase']
            },
            {
                'selector': 'enum',
                'format': ['PascalCase']
            },
            {
                'selector': 'variable',
                'format': ['camelCase', 'UPPER_CASE', 'PascalCase'],
                'filter': {
                    'regex': 'Model$',
                    'match': true
                },
                'format': ['PascalCase']
            }
        ]
    },
    overrides: [
        {
            // Rules specific to controllers
            files: ['src/modules/*/controllers/*.ts'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'error'
            }
        },
        {
            // Rules specific to services
            files: ['src/modules/*/services/*.ts'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'error',
                'no-console': 'error'
            }
        },
        {
            // Rules specific to routes
            files: ['src/modules/*/routes/*.ts'],
            rules: {
                'import/no-cycle': 'error'
            }
        },
        {
            // Rules specific to models
            files: ['src/modules/*/models/*.ts'],
            rules: {
                '@typescript-eslint/naming-convention': [
                    'error',
                    {
                        'selector': 'variable',
                        'format': ['PascalCase'],
                        'filter': {
                            'regex': 'Schema|Model',
                            'match': true
                        }
                    }
                ]
            }
        }
    ]
}; 