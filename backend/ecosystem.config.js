// Production environment variables for backend pm2 process manager
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'src/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },

    }
  ]
}