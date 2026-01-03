require('dotenv').config();
// Production environment variables for backend pm2 process manager
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'src/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.BACKEND_PORT || 5000
      },

    }
  ]
}