module.exports = {
    apps: [
        {
            name: 'sharaga',
            script: './app.js',
            env_production: {
                NODE_ENV: 'production'
            }
        },
        {
            script: './service-worker/',
            watch: ['./service-worker']
        }
    ]
};
