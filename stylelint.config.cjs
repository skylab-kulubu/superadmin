module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
  plugins: ['stylelint-order'],
  ignoreFiles: [
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/out/**',
    'src/app/globals.css',
  ],
  rules: {
    'color-hex-length': null,
    'order/properties-alphabetical-order': null,
    'declaration-block-single-line-max-declarations': null,
    'rule-empty-line-before': null,
  },
};
