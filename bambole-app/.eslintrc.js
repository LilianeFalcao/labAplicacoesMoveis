module.exports = {
    extends: 'expo',
    plugins: ['@typescript-eslint'],
    rules: {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-explicit-any': 'error',
    },
};
