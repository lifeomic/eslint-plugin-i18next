module.exports = {
  extends: ['@lifeomic/standards'],
  overrides: [
    // Set correct env for config files
    {
      files: ['*.js'],
      env: {
        node: true,
      },
    },
  ],
};
