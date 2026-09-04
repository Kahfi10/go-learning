module.exports = {
  apps: [
    {
      name: "golearn-backend",
      cwd: "./backend",
      script: "./server",
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        PORT: 8081,
        NODE_ENV: "production",
      },
    },
    {
      name: "golearn-frontend",
      cwd: "./frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      exec_mode: "cluster",
      instances: "max",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
