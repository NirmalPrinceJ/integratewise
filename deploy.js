#!/usr/bin/env node

/**
 * IntegrateWise Website - Automated Deployment Script
 * Usage: npm run deploy
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check if required packages are installed
try {
    require('ftp');
    require('ssh2-sftp-client');
} catch (e) {
    console.log('Installing required packages...');
    console.log('Please run: npm install');
    process.exit(1);
}

const Client = require('ssh2-sftp-client');
const FTP = require('ftp');

const config = {
    host: process.env.FTP_HOST || 'your-domain.com',
    username: process.env.FTP_USER || '',
    password: process.env.FTP_PASS || '',
    port: process.env.USE_SFTP === 'true' ? (process.env.SFTP_PORT || 22) : (process.env.FTP_PORT || 21),
    useSFTP: process.env.USE_SFTP === 'true',
    remotePath: process.env.FTP_PATH || '/public_html'
};

// Files to upload
const filesToUpload = [
    'index.html',
    'about.html',
    'services.html',
    'case-studies.html',
    'resources.html',
    'contact.html',
    'business-plan.html',
    'styles.css',
    'script.js',
    '.htaccess'
];

// Directories to upload
const dirsToUpload = [
    'images'
];

async function deploy() {
    console.log('🚀 Starting IntegrateWise deployment...\n');

    if (!config.username || !config.password) {
        console.error('❌ Error: FTP credentials not configured!');
        console.log('Please create a .env file with:');
        console.log('FTP_HOST=your-domain.com');
        console.log('FTP_USER=your_username');
        console.log('FTP_PASS=your_password');
        console.log('FTP_PATH=/public_html');
        process.exit(1);
    }

    try {
        if (config.useSFTP) {
            await deploySFTP();
        } else {
            await deployFTP();
        }
        
        console.log('\n✅ Deployment completed successfully!');
        console.log(`🌐 Your website should be live at: http://${config.host}`);
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

async function deploySFTP() {
    const sftp = new Client();
    
    console.log('📡 Connecting via SFTP...');
    await sftp.connect({
        host: config.host,
        username: config.username,
        password: config.password,
        port: config.port
    });

    console.log('✅ Connected!');
    console.log('📤 Uploading files...\n');

    // Change to remote directory
    await sftp.mkdir(config.remotePath, true);
    await sftp.cwd(config.remotePath);

    // Upload files
    for (const file of filesToUpload) {
        if (fs.existsSync(file)) {
            console.log(`  📄 Uploading ${file}...`);
            await sftp.put(file, path.basename(file));
        } else {
            console.warn(`  ⚠️  File not found: ${file}`);
        }
    }

    // Upload directories
    for (const dir of dirsToUpload) {
        if (fs.existsSync(dir)) {
            console.log(`  📁 Uploading directory ${dir}...`);
            await sftp.uploadDir(dir, `${config.remotePath}/${dir}`);
        }
    }

    // Set permissions
    console.log('\n🔐 Setting file permissions...');
    for (const file of filesToUpload) {
        try {
            await sftp.chmod(`${config.remotePath}/${file}`, 0o644);
        } catch (e) {
            // Ignore permission errors
        }
    }

    await sftp.end();
}

async function deployFTP() {
    return new Promise((resolve, reject) => {
        const client = new FTP();
        
        console.log('📡 Connecting via FTP...');
        
        client.on('ready', async () => {
            console.log('✅ Connected!');
            console.log('📤 Uploading files...\n');

            try {
                // Change to remote directory
                await new Promise((res, rej) => {
                    client.cwd(config.remotePath, (err) => {
                        if (err) {
                            client.mkdir(config.remotePath, true, (err2) => {
                                if (err2) rej(err2);
                                else client.cwd(config.remotePath, res);
                            });
                        } else res();
                    });
                });

                // Upload files
                for (const file of filesToUpload) {
                    if (fs.existsSync(file)) {
                        console.log(`  📄 Uploading ${file}...`);
                        await new Promise((res, rej) => {
                            client.put(file, path.basename(file), (err) => {
                                if (err) rej(err);
                                else res();
                            });
                        });
                    } else {
                        console.warn(`  ⚠️  File not found: ${file}`);
                    }
                }

                // Upload directories recursively
                for (const dir of dirsToUpload) {
                    if (fs.existsSync(dir)) {
                        console.log(`  📁 Uploading directory ${dir}...`);
                        await uploadDirectory(client, dir, `${config.remotePath}/${dir}`);
                    }
                }

                client.end();
                resolve();
            } catch (error) {
                client.end();
                reject(error);
            }
        });

        client.on('error', (err) => {
            reject(err);
        });

        client.connect({
            host: config.host,
            user: config.username,
            password: config.password,
            port: config.port
        });
    });
}

function uploadDirectory(client, localDir, remoteDir) {
    return new Promise((resolve, reject) => {
        client.mkdir(remoteDir, true, (err) => {
            if (err && err.code !== 550) {
                return reject(err);
            }

            const files = fs.readdirSync(localDir);
            let uploaded = 0;
            const total = files.length;

            if (total === 0) {
                return resolve();
            }

            files.forEach((file) => {
                const localPath = path.join(localDir, file);
                const remotePath = `${remoteDir}/${file}`;
                const stat = fs.statSync(localPath);

                if (stat.isDirectory()) {
                    uploadDirectory(client, localPath, remotePath)
                        .then(() => {
                            uploaded++;
                            if (uploaded === total) resolve();
                        })
                        .catch(reject);
                } else {
                    client.put(localPath, remotePath, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        uploaded++;
                        if (uploaded === total) resolve();
                    });
                }
            });
        });
    });
}

// Run deployment
deploy();
