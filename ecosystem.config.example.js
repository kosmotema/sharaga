module.exports = {
  apps: [
    {
      name: 'sharaga',
      script: './app.js'
    },
    {
      script: './service-worker/',
      watch: ['./service-worker']
    }
  ]
};
