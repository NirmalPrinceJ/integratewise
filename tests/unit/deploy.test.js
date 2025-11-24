/**
 * Tests for deploy.js - Deployment script functionality
 */

const fs = require('fs');
const path = require('path');

describe('Deploy Script Tests', () => {
  const deployScript = path.join(__dirname, '../../deploy.js');
  
  test('deploy script should exist', () => {
    expect(fs.existsSync(deployScript)).toBe(true);
  });

  test('should have required files list', () => {
    const scriptContent = fs.readFileSync(deployScript, 'utf8');
    
    expect(scriptContent).toContain('filesToUpload');
    expect(scriptContent).toContain('index.html');
    expect(scriptContent).toContain('styles.css');
  });

  test('should check for required packages', () => {
    const scriptContent = fs.readFileSync(deployScript, 'utf8');
    
    expect(scriptContent).toContain('require(\'ftp\')');
    expect(scriptContent).toContain('require(\'ssh2-sftp-client\')');
  });
});

describe('File Structure Tests', () => {
  const projectRoot = path.join(__dirname, '../..');
  
  test('required HTML files should exist', () => {
    const requiredFiles = [
      'index.html',
      'about.html',
      'services.html',
      'contact.html'
    ];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(projectRoot, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('CSS and JS files should exist', () => {
    expect(fs.existsSync(path.join(projectRoot, 'styles.css'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, 'script.js'))).toBe(true);
  });

  test('images directory should exist', () => {
    const imagesPath = path.join(projectRoot, 'images');
    expect(fs.existsSync(imagesPath)).toBe(true);
  });
});

