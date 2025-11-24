/**
 * Tests for script.js - Frontend JavaScript functionality
 */

describe('Script.js Tests', () => {
  let container;
  let mobileToggle;
  let navMenu;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="mobileToggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div id="navMenu" class="nav-menu"></div>
      <div class="page-loader"></div>
    `;
    
    mobileToggle = document.getElementById('mobileToggle');
    navMenu = document.getElementById('navMenu');
    
    // Load script.js
    require('../../script.js');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('mobile menu toggle should exist', () => {
    expect(mobileToggle).toBeTruthy();
    expect(navMenu).toBeTruthy();
  });

  test('page loader should be removed on load', (done) => {
    const loader = document.querySelector('.page-loader');
    expect(loader).toBeTruthy();
    
    window.dispatchEvent(new Event('load'));
    
    setTimeout(() => {
      const loaderAfter = document.querySelector('.page-loader');
      expect(loaderAfter).toBeNull();
      done();
    }, 400);
  });

  test('mobile toggle should add active class to nav menu', (done) => {
    expect(navMenu.classList.contains('active')).toBe(false);
    
    // Trigger DOMContentLoaded to initialize event listeners
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Wait a bit for event listeners to attach
    setTimeout(() => {
      mobileToggle.click();
      expect(navMenu.classList.contains('active')).toBe(true);
      done();
    }, 100);
  });
});

describe('Form Validation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="contactForm">
        <input type="email" id="email" required>
        <input type="text" id="name" required>
        <button type="submit">Submit</button>
      </form>
    `;
  });

  test('form should have required fields', () => {
    const email = document.getElementById('email');
    const name = document.getElementById('name');
    
    expect(email.hasAttribute('required')).toBe(true);
    expect(name.hasAttribute('required')).toBe(true);
  });
});

