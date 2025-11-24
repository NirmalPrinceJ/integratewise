/**
 * Integration tests for HTML validation
 */

const fs = require('fs');
const path = require('path');

describe('HTML Validation Tests', () => {
  const htmlFiles = [
    'index.html',
    'about.html',
    'services.html',
    'case-studies.html',
    'resources.html',
    'contact.html'
  ];

  htmlFiles.forEach(file => {
    test(`${file} should have valid HTML structure`, () => {
      const filePath = path.join(__dirname, '../..', file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for DOCTYPE
      expect(content).toMatch(/<!DOCTYPE html>/i);
      
      // Check for html tag
      expect(content).toMatch(/<html/i);
      
      // Check for head and body
      expect(content).toMatch(/<head/i);
      expect(content).toMatch(/<body/i);
      
      // Check for title
      expect(content).toMatch(/<title/i);
    });

    test(`${file} should have navigation`, () => {
      const filePath = path.join(__dirname, '../..', file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toMatch(/nav/i);
    });

    test(`${file} should link to styles.css`, () => {
      const filePath = path.join(__dirname, '../..', file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toMatch(/styles\.css/);
    });
  });
});

describe('CSS Validation', () => {
  test('styles.css should exist and have content', () => {
    const cssPath = path.join(__dirname, '../..', 'styles.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    
    const content = fs.readFileSync(cssPath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });
});

