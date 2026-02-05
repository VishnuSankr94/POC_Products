# Meletheruvu Sree Mutharamman Temple Website

A modern, responsive website for the Meletheruvu Sree Mutharamman Temple located in Swadeshabhimani Nagar, Neyyattinkara, Thiruvananthapuram, Kerala.

## 🏛️ About the Temple

**Principal Deity:** Sri Mutharamman  
**Secondary Deities:** Sri Parameswaran (Bhairavan) and Bhadrakali  
**Location:** Swadeshabhimani Nagar, Neyyattinkara, Thiruvananthapuram, Kerala  
**Address:** 93WQ+V8Q, Poovar - Neyyatinkara Rd, Swadeshabhimani Nagar, Neyyattinkara, Kerala 695121, India

## ✨ Features

### 🌟 Complete Website Sections
- **Home Page:** Welcoming introduction with hero section
- **About Us:** Temple history, significance, and heritage
- **Deities:** Detailed information about Sri Mutharamman, Sri Parameswaran, and Bhadrakali
- **Festivals:** Ammankoda Mahotsavam and Navaratri celebrations
- **Darshan Timings:** Visiting hours and guidelines
- **Vazhipadu (Offerings):** Sacred offerings and ritual booking
- **Gallery:** Photo and video showcase with filtering
- **Contact:** Address, contact form, and location map
- **Donation:** Multiple payment options for temple support

### 🎨 Design Features
- **Modern UI/UX:** Beautiful, intuitive design inspired by Kerala temple aesthetics
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices
- **Kerala Temple Theme:** Warm colors (saffron, gold, brown) reflecting traditional temple architecture
- **Smooth Animations:** Engaging scroll effects and hover animations
- **Accessibility:** WCAG compliant with keyboard navigation support

### 🚀 Technical Features
- **Fast Loading:** Optimized performance with lazy loading
- **SEO Friendly:** Semantic HTML and meta tags
- **Cross-browser Compatible:** Works on all modern browsers
- **Mobile-first Approach:** Designed for mobile users first
- **Interactive Elements:** Dynamic gallery filters, contact forms, smooth scrolling

## 🛠️ Technical Stack

- **HTML5:** Semantic markup structure
- **CSS3:** Modern styling with flexbox and grid
- **JavaScript (ES6+):** Interactive functionality
- **Font Awesome:** Professional icons
- **Google Fonts:** Beautiful typography (Playfair Display & Inter)

## 📁 File Structure

```
temple-website/
├── index.html          # Main HTML file
├── styles.css          # Comprehensive styling
├── script.js           # JavaScript functionality
└── README.md           # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for local development)

### Installation & Setup

1. **Download/Clone the files:**
   ```bash
   # If using git
   git clone [repository-url]
   
   # Or simply download the files to a folder
   ```

2. **Local Development:**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx serve .
   
   # Using PHP (if installed)
   php -S localhost:8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

### Deployment Options

#### Option 1: GitHub Pages (Free)
1. Create a GitHub repository
2. Upload files to the repository
3. Go to Settings > Pages
4. Select source branch (main/master)
5. Your site will be available at `https://username.github.io/repository-name`

#### Option 2: Netlify (Free)
1. Sign up at [Netlify](https://netlify.com)
2. Drag and drop your folder to Netlify
3. Get instant deployment with custom domain options

#### Option 3: Traditional Web Hosting
1. Purchase hosting from any provider (Hostinger, Bluehost, etc.)
2. Upload files via FTP/cPanel File Manager
3. Configure domain settings

#### Option 4: Firebase Hosting (Free)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🎨 Customization Guide

### Colors & Branding
Edit `styles.css` to modify the temple's color scheme:
```css
:root {
    --primary-color: #FF6B35;    /* Temple saffron */
    --secondary-color: #F7931E;  /* Golden yellow */
    --accent-color: #8B4513;     /* Temple brown */
    --text-color: #333;          /* Dark text */
}
```

### Content Updates
- **Temple Information:** Edit content in `index.html`
- **Contact Details:** Update phone numbers and email addresses
- **Festival Dates:** Modify event dates in the festivals section
- **Offering Prices:** Update vazhipadu prices and options

### Adding Images
1. Create an `images/` folder
2. Add temple photos, deity images, festival pictures
3. Update image paths in HTML:
   ```html
   <img src="images/temple-main.jpg" alt="Temple Main View">
   ```

### Gallery Enhancement
Replace placeholder gallery items with actual photos:
```html
<div class="gallery-item" data-category="temple">
    <img src="images/temple-entrance.jpg" alt="Temple Entrance">
</div>
```

## 📱 Mobile Optimization

The website is fully responsive with:
- **Mobile Navigation:** Hamburger menu for small screens
- **Touch-friendly:** Buttons and links optimized for touch
- **Fast Loading:** Optimized images and code
- **Readable Text:** Proper font sizes and spacing

## 🔧 Maintenance

### Regular Updates Needed
- **Festival Dates:** Update upcoming events and celebrations
- **Darshan Timings:** Modify temple visiting hours if changed
- **Contact Information:** Keep phone numbers and addresses current
- **Gallery:** Add new photos from recent festivals and events

### Performance Monitoring
- Test website speed using Google PageSpeed Insights
- Monitor mobile usability with Google Mobile-Friendly Test
- Check accessibility with WAVE Web Accessibility Evaluator

## 📞 Support & Contact

For technical support or website updates:
- **Template Developer:** Available for modifications and enhancements
- **Content Updates:** Can be done by temple administration
- **Technical Issues:** Contact your web hosting provider

## 🙏 Features for Future Enhancement

### Phase 2 Additions
- **Online Booking System:** Book poojas and offerings online
- **Live Streaming:** Stream daily prayers and festivals
- **Devotee Portal:** Member registration and donation tracking
- **Multi-language Support:** Tamil and Malayalam translations
- **Mobile App:** Native iOS/Android applications
- **E-commerce:** Sell temple products and prasadam online

### Technical Enhancements
- **Content Management System (CMS):** Easy content updates
- **Database Integration:** Store devotee information and bookings
- **Payment Gateway:** Secure online payment processing
- **Push Notifications:** Festival and event reminders
- **SEO Optimization:** Enhanced search engine visibility

## 🌟 Benefits of This Website

### For Devotees
- **Easy Access:** Find temple information instantly
- **Festival Updates:** Stay informed about celebrations
- **Contact Options:** Multiple ways to reach the temple
- **Donation Options:** Convenient online contributions

### For Temple Administration
- **Professional Presence:** Modern, credible online image
- **Increased Reach:** Attract devotees from wider areas
- **Reduced Inquiries:** Self-service information access
- **Community Building:** Enhanced devotee engagement

### For the Community
- **Cultural Preservation:** Showcase Kerala temple traditions
- **Event Promotion:** Spread awareness about festivals
- **Tourism Support:** Attract visitors to the region
- **Digital Heritage:** Document temple history and customs

## 📊 Analytics & Tracking

To monitor website performance, add Google Analytics:
```html
<!-- Add to <head> section of index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 📝 License

This website template is created specifically for Meletheruvu Sree Mutharamman Temple. The design and code can be modified as needed for the temple's requirements.

---

**🕉️ May Sri Mutharamman's blessings be with all devotees who visit our digital temple! 🙏**

For any questions or support regarding this website, please contact the temple administration or your technical support team.
