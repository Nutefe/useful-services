module.exports = {
  apps: [
    {
      name: 'useful-auth',
      script: './dist/apps/auth-services/main.js',
      cwd: '/var/www/html/poc-service',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'useful-convoc',
      script: './dist/apps/convoc-services/main.js',
      cwd: '/var/www/html/poc-service',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'useful-email',
      script: './dist/apps/email-services/main.js',
      cwd: '/var/www/html/poc-service',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'useful-file',
      script: './dist/apps/file-services/main.js',
      cwd: '/var/www/html/poc-service',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'useful-notification',
      script: './dist/apps/notification-services/main.js',
      cwd: '/var/www/html/poc-service',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
