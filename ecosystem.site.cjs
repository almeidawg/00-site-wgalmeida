module.exports = {
  apps: [
    {
      name: 'site',
      cwd: 'C:/Users/Atendimento/Documents/_GRUPO_WG_ALMEIDA/01_APPS/02_BUILDTECH/04_OPERACIONAL/02_20260310_Projetos/02_20260310_Desenvolvimento/_Grupo_WG_Almeida/site-wgalmeida/site-wgalmeida',
      script: './node_modules/vite/bin/vite.js',
      args: 'preview --host 0.0.0.0 --port 3011',
      interpreter: 'C:/Users/Atendimento/AppData/Local/nvm/v24.11.0/node.exe',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PM2_HOME: 'C:/AI/.pm2'
      }
    }
  ]
}
