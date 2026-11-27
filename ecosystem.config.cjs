module.exports = {
  apps: [
    {
      name: 'wa-ai-bot',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
      env: {
        NODE_ENV: 'production',
      },
      // Jeda restart bertahap jika terjadi error beruntun
      exp_backoff_restart_delay: 2000,
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
