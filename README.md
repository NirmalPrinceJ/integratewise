# IntegrateWise Website & Business Plan

This directory contains the complete IntegrateWise professional website and business plan ready for deployment.

## 📁 Files Included

### Website Files
- `index.html` - Homepage with value proposition and services overview
- `about.html` - Company story, philosophy, and leadership
- `services.html` - Detailed service offerings with pricing
- `case-studies.html` - Success stories from Finance, Logistics, and Healthcare
- `resources.html` - Platform comparisons, tools, and guides
- `contact.html` - Contact forms and consultation booking
- `styles.css` - Complete styling for all pages
- `script.js` - Interactive functionality

### Business Documents
- `business-plan.html` - Comprehensive business plan and executive summary
- `Action_Plan.md` - System setup guide for Notion + Coda
- `Integratewise_Notion_Schema.md` - Notion database schemas
- `Integratewise_Coda_Schema.md` - Coda control layer schema
- `Zapier_Integration_Plan.md` - Integration workflows

## 🚀 Quick Deployment

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in this directory
3. Follow the prompts
4. Your site will be live at `https://your-project.vercel.app`

### Option 2: Netlify
1. Drag and drop this folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your site will be instantly deployed

### Option 3: GitHub Pages
1. Create a new GitHub repository
2. Upload all files
3. Go to Settings → Pages
4. Select source as "Deploy from a branch"
5. Choose main branch and root folder
6. Your site will be live at `https://username.github.io/repository-name`

### Option 4: Traditional Hosting
Upload all files to your web hosting provider's public_html or www directory.

## 🎯 Immediate Next Steps

1. **Update Contact Information**
   - Replace placeholder phone number in all HTML files
   - Update email address if different from info@integratewise.com

2. **Customize Content**
   - Add actual client testimonials
   - Update case study details with your specific projects
   - Add real platform certification badges

3. **Set Up Analytics**
   - Add Google Analytics or similar tracking code
   - Set up conversion tracking for contact forms

4. **Connect Forms**
   - Integrate contact forms with your CRM
   - Set up email notifications
   - Add form validation and spam protection

## 📊 Website Features

- **Responsive Design**: Works on all devices
- **Fast Loading**: Optimized for performance
- **SEO Ready**: Proper meta tags and structure
- **Professional Look**: Modern, clean design
- **Clear CTAs**: Focused on conversions
- **Platform Agnostic**: Highlights your unique value

## 💼 Business Plan Highlights

The business plan includes:
- Executive summary with key metrics
- Market opportunity analysis ($50B market)
- Service portfolio with pricing
- Competitive advantages
- Partnership-led business model
- Growth strategy and roadmap
- Financial projections (kept internal as requested)

## 🔧 Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-blue: #2563eb;
    --primary-dark: #1e40af;
    /* etc... */
}
```

### Adding Pages
1. Copy an existing HTML file
2. Update the navigation in all files
3. Add corresponding styles in styles.css

### Updating Services/Pricing
Edit the service cards in `services.html` and homepage

### Adding Company Logos

The website includes logo placeholders in several locations:

#### Platform Logos (index.html)
- Located in the "Platform Expertise" section
- Currently using logo URLs from company websites
- To add your own logos:
  1. Download logos from official sources (with permission)
  2. Save to `/images/logos/` folder
  3. Update image `src` attributes in HTML

#### Trusted By Section (index.html)
- Shows partner/client logos
- Currently using Clearbit logo API
- To add actual client logos:
  ```html
  <div class="logo-item">
      <img src="images/logos/client-name.svg" alt="Client Name" class="company-logo">
  </div>
  ```

#### Case Study Logos (case-studies.html)
- Placeholder logos in each case study header
- Replace with actual client logos (with permission):
  ```html
  <div class="case-study-logo">
      <img src="images/logos/client-logo.png" alt="Client Name">
  </div>
  ```

**Logo Requirements:**
- Format: SVG (preferred) or PNG with transparent background
- Size: Max 200px width, 60px height
- Location: Create `/images/logos/` folder in root directory
- Naming: Use lowercase with hyphens (e.g., `mulesoft-logo.svg`)

**Logo Sources:**
- Platform logos: Official partner portals or brand guidelines
- Client logos: Request from clients with written permission
- Use high-quality, professional logos only

## 📞 Support

For questions about deployment or customization, consult the documentation for your chosen platform:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [GitHub Pages Docs](https://pages.github.com)

## ✅ Launch Checklist

- [ ] Update all contact information
- [ ] Add real client logos (with permission)
- [ ] Set up form handling
- [ ] Configure custom domain
- [ ] Add SSL certificate
- [ ] Set up email forwarding
- [ ] Add analytics tracking
- [ ] Test all links and forms
- [ ] Optimize images for web
- [ ] Create social media profiles
- [ ] Submit to Google Business

## 🎉 Ready to Launch!

Your IntegrateWise website is ready to establish your professional presence and attract clients and partners. The clean design and clear messaging will help you stand out in the integration consulting space.

Remember: The website is your "face" - now you can focus on building partnerships and delivering value to clients!
