require('dotenv').config();
// Production environment variables for backend pm2 process manager
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'src/server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.BACKEND_PORT || 5000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    }
  ]
}