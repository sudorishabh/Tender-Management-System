# TERI Tenders SEO Strategy

## Ranking #1 for "TERI", "Tender", and Related Keywords

**Target Domain:** etender.teri.res.in  
**Primary Goal:** Rank #1 for "TERI tender" and top 10 for "TERI" and "tender"

---

## 1. ON-PAGE SEO (Implemented)

### Title Tag Optimization

```
Primary: "TERI Tenders | Official eTender Portal - The Energy and Resources Institute"
Template: "{Page Title} | TERI Tenders"
```

The template is kept short so long tender titles still end in the brand within the ~60 characters search results show.

### Meta Description (under 160 characters)

```
"Official eTender portal of The Energy and Resources Institute (TERI). Find open TERI tenders, download tender documents and submit your bids online."
```

### Keyword Strategy (Implemented in seo.config.ts)

| Priority             | Keywords                                                             | Search Intent   |
| -------------------- | -------------------------------------------------------------------- | --------------- |
| **P1 - Exact Match** | TERI tender, TERI tenders, TERI eTender                              | Navigational    |
| **P2 - Brand**       | TERI, The Energy and Resources Institute                             | Brand awareness |
| **P3 - Generic**     | tender, eTender, tender portal, online tender                        | Informational   |
| **P4 - Long-tail**   | TERI tender 2025, TERI vendor registration, how to apply TERI tender | Transactional   |
| **P5 - Industry**    | sustainable procurement, green tender                                | Informational   |

### Content Keywords Distribution

- **H1:** Include "TERI" + "Tender" (✅ Implemented)
- **H2s:** Include variations (eTender, Procurement, Bidding)
- **Body:** Natural keyword density 1-2%
- **Alt tags:** Include "TERI tender" in relevant images

---

## 2. TECHNICAL SEO (Implemented)

### ✅ Completed Technical Elements

| Element           | Status | File                     |
| ----------------- | ------ | ------------------------ |
| Meta tags         | ✅     | `lib/seo.config.ts`      |
| Open Graph        | ✅     | `lib/seo.config.ts`      |
| Twitter Cards     | ✅     | `lib/seo.config.ts`      |
| Sitemap.xml       | ✅     | `app/sitemap.ts`         |
| Robots.txt        | ✅     | `app/robots.ts`          |
| JSON-LD Schemas   | ✅     | `lib/structured-data.ts` |
| Canonical URLs    | ✅     | All pages                |
| Mobile responsive | ✅     | Tailwind CSS             |
| HTTPS             | ✅     | Server config            |
| Page speed        | ✅     | `next.config.ts`         |

### Structured Data Schemas (Implemented)

1. **Organization** - Links to teriin.org
2. **WebSite** - With SearchAction
3. **Service** - eTender management
4. **FAQPage** - Common tender questions
5. **Product** - Individual tenders
6. **BreadcrumbList** - Navigation

---

## 3. CONTENT STRATEGY

### A. Create Keyword-Rich Pages

#### Must-Have Pages:

1. **About TERI Tenders** (`/about`)

   - Keywords: TERI, The Energy and Resources Institute, tender portal
   - Content: History, mission, how it connects to teriin.org

2. **How to Apply for TERI Tenders** (`/how-to-apply`)

   - Keywords: TERI tender application, how to bid TERI, TERI vendor registration
   - Content: Step-by-step guide with screenshots

3. **TERI Tender FAQ** (`/faq`)

   - Keywords: TERI tender questions, tender help, bid submission
   - Content: 15-20 common questions with rich answers

4. **Current Tenders** (`/`)

   - Keywords: TERI open tenders, active tenders, latest TERI tender
   - Content: Dynamic tender listings with filters

5. **Tender Categories** (`/categories`)

   - Keywords: TERI research tender, TERI environment tender, TERI energy tender
   - Content: Category pages for each tender type

6. **Vendor Registration Guide** (`/register/guide`)
   - Keywords: TERI vendor registration, become TERI supplier
   - Content: Eligibility, documents, process

### B. Blog/News Section (Recommended)

Create `/blog` or `/news` with articles:

```
- "Understanding TERI Tender Process 2025"
- "Top Tips for Winning TERI Tenders"
- "TERI Sustainable Procurement Guidelines"
- "Complete Guide to E-Tender Submission in India"
```

### C. Dynamic Content

Each tender page should include:

- Tender title with "TERI" naturally included
- Department/category with schema markup
- Deadline with Event schema
- Estimated value
- Related tenders section

---

## 4. BACKLINK STRATEGY

### A. High-Priority Backlinks

| Source                  | Type                        | Action Required                                  |
| ----------------------- | --------------------------- | ------------------------------------------------ |
| **teriin.org**          | Main TERI website           | Add prominent link to etender.teri.res.in        |
| **teriin.org/tenders**  | Existing page               | 301 redirect or canonical to etender.teri.res.in |
| **TERI social media**   | LinkedIn, Twitter, Facebook | Regular posts linking to tenders                 |
| **TERI press releases** | News                        | Include etender portal link                      |
| **TERI newsletters**    | Email                       | Monthly tender roundup                           |

### B. Directory Submissions

Submit to:

1. India business directories
2. NGO/Think tank directories
3. Procurement industry directories
4. Environment/Sustainability portals

### C. Partnership Links

Request links from:

1. TERI partner organizations
2. Past tender winners (testimonials)
3. Industry associations
4. Academic institutions collaborating with TERI

### D. Content-Based Backlinks

1. Guest posts on procurement blogs
2. Industry reports with TERI tender data
3. Infographics about TERI tender statistics
4. Press releases for major tenders

---

## 5. LOCAL SEO

### Google Business Profile

- Create/claim "TERI Tenders" business listing
- Category: "Business Service"
- Address: TERI Delhi headquarters
- Add photos, posts, Q&A

### Local Schema (Add to structured-data.ts)

```json
{
  "@type": "LocalBusiness",
  "name": "TERI Tenders Office",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Darbari Seth Block, IHC Complex, Lodhi Road",
    "addressLocality": "New Delhi",
    "postalCode": "110003",
    "addressCountry": "IN"
  }
}
```

---

## 6. AUTHORITY BUILDING

### A. Brand Signals

1. **Consistent NAP** (Name, Address, Phone) across all platforms
2. **Social profiles** linking to etender.teri.res.in
3. **Wikipedia** - Ensure TERI Wikipedia page mentions tender portal
4. **News coverage** - Press releases for major tenders

### B. Trust Signals

1. SSL certificate (HTTPS) ✅
2. Privacy policy page
3. Terms and conditions page ✅
4. Contact information ✅
5. TERI branding and logo ✅

### C. User Engagement Metrics

Improve to boost rankings:

1. **Reduce bounce rate** - Engaging landing page ✅
2. **Increase time on site** - Rich tender details
3. **Improve CTR** - Compelling meta descriptions ✅
4. **Mobile experience** - Responsive design ✅

---

## 7. GOOGLE SEARCH CONSOLE SETUP

### Required Actions:

1. **Verify ownership** of etender.teri.res.in
2. **Submit sitemap**: `https://etender.teri.res.in/sitemap.xml`
3. **Request indexing** for key pages
4. **Monitor** search queries and CTR
5. **Fix** any crawl errors

### Priority URLs to Submit:

```
https://etender.teri.res.in/
https://etender.teri.res.in/about
https://etender.teri.res.in/register
https://etender.teri.res.in/sign-in
https://etender.teri.res.in/faq
```

---

## 8. COMPETITOR ANALYSIS

### Direct Competitors for "tender" keyword:

1. gem.gov.in (Government e-Marketplace)
2. eprocure.gov.in (Central Public Procurement Portal)
3. tendertiger.com
4. tendersinfo.com
5. bidassist.com

### Strategy to Outrank:

- **For "TERI tender"**: Be the ONLY authoritative source
- **For "tender"**: Focus on long-tail + TERI association
- **For "TERI"**: Leverage official connection to teriin.org

---

## 9. TRACKING & KPIs

### Key Metrics to Track:

| Metric                    | Tool                  | Target           |
| ------------------------- | --------------------- | ---------------- |
| Ranking for "TERI tender" | Google Search Console | #1               |
| Ranking for "TERI"        | Search Console        | Top 10           |
| Organic traffic           | Analytics             | +50% in 6 months |
| Click-through rate        | Search Console        | >5%              |
| Bounce rate               | Analytics             | <50%             |
| Page speed score          | PageSpeed Insights    | >90              |
| Core Web Vitals           | Search Console        | All green        |

### Monthly Tasks:

1. Check keyword rankings
2. Review Search Console for new queries
3. Update sitemap with new tenders
4. Publish 2-4 blog/news articles
5. Build 5-10 quality backlinks
6. Social media promotion

---

## 10. IMPLEMENTATION TIMELINE

### Month 1: Foundation

- [x] Technical SEO implementation
- [x] Metadata optimization
- [x] Structured data
- [ ] Google Search Console setup
- [ ] Request backlink from teriin.org

### Month 2: Content

- [ ] Create FAQ page
- [ ] Create How-to-Apply guide
- [ ] Optimize About page with keywords
- [ ] Add blog section

### Month 3: Authority

- [ ] Directory submissions
- [ ] Social media optimization
- [ ] Partner outreach for backlinks
- [ ] Press release for portal launch

### Month 4-6: Scaling

- [ ] Regular content publishing
- [ ] Link building campaigns
- [ ] Monitor and optimize based on data
- [ ] A/B test meta descriptions for CTR

---

## 11. QUICK WINS

### Immediate Actions (This Week):

1. **Add link from teriin.org homepage** to etender.teri.res.in

   - This is the #1 most impactful action
   - Request IT team to add "eTender Portal" in navigation

2. **Update teriin.org/tenders** (if exists) to redirect here

3. **Post on TERI LinkedIn** about the tender portal

4. **Submit to Google Search Console** and request indexing

5. **Verify mobile-friendliness** with Google's tool

---

## 12. EXPECTED RESULTS

| Timeframe | "TERI tender" | "TERI" | "tender"   |
| --------- | ------------- | ------ | ---------- |
| Month 1   | Top 10        | Top 50 | Not ranked |
| Month 3   | Top 3         | Top 30 | Top 100    |
| Month 6   | #1            | Top 10 | Top 50     |
| Month 12  | #1            | Top 5  | Top 30     |

**Note:** Ranking for generic "tender" is extremely competitive. Focus on "TERI tender" for guaranteed #1 position.
