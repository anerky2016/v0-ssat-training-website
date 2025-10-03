module.exports = {
  apps: [{
    name: "ssat-web",
    cwd: "/root/v0-ssat-training-website",
    script: "npm",
    args: "run start",
    env: {
      NODE_ENV: "production",
      PORT: "3000"   // change if you use a different port
    },
    watch: false,             // set to true only if you really want auto-restart on file changes
    max_memory_restart: "512M",
    instances: 1,             // or "max" for cluster mode if app is stateless
    autorestart: true
  }]
}
