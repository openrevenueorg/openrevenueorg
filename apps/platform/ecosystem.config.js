module.exports = {
    apps: [
        {
            name: 'web',
            script: 'server.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'jobs',
            script: 'npx',
            args: 'tsx src/jobs/index.ts',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
