# TrustMRR - Technical Specification Document

## Overview

TrustMRR is a database platform for verified startup revenues. It displays real-time revenue data from startups connected via Stripe, LemonSqueezy, and Polar API keys, updated hourly.

***

## Core Features & Functionalities

### 1. Homepage / Leaderboard

#### 1.1 Header Section

- **Branding**: TrustMRR logo with navigation
- **Main Tagline**: "The database of verified startup revenues"
- **Search Bar**: Global search for startups, founders, and categories
- **Add Startup Button**: CTA for users to submit their startup

#### 1.2 Navigation Menu

- New
- Search
- Stats
- Categories
- Acquisition
- $1 vs $1,000,000 (Game)
- Buy & Sell Micro-SaaS banner

#### 1.3 Leaderboard Table

**Columns:**

- Rank # (with medals for top 3: 🥇🥈🥉)
- Startup (logo, name, description)
- Founder (profile pic, name, X followers count)
- MRR (Monthly Recurring Revenue)
- MoM Growth (Month-over-Month growth percentage with up/down indicators)

**Features:**

- Sortable by MRR or Total Revenue
- Time filter: All time (default)
- "Show more" button to load additional startups (paginated by 50)
- Displays top 100 startups by default

#### 1.4 Warren Buffett Game Teaser

- Image of Warren Buffett with "$1 or $1,000,000?" prompt
- Links to the game page

#### 1.5 Category Browse Section

**Categories displayed as buttons:**

- Artificial Intelligence
- SaaS
- Developer Tools
- Fintech
- Productivity
- Marketing
- E-commerce
- Design Tools
- No-Code
- Analytics
- Education
- Health & Fitness
- Social Media
- Content Creation
- Sales
- Customer Support
- Recruiting & HR
- Real Estate
- Travel
- Security

#### 1.6 Newsletter Signup Widget

- "Spot the Next Big Thing" header
- Unicorn mascot graphic
- Email input field
- "Send me the data" CTA button
- Promise: "Top 5 fastest growing startups, best 3 startups for sale, and 1 underdog spotlight"
- Social proof: "500+ entrepreneurs subscribed"

#### 1.7 Verification Notice

- "All revenue is verified through Stripe/LemonSqueezy/Polar API keys. Data is updated hourly."

***

### 2. Advanced Search Page (`/search`)

#### 2.1 Header

- Title: "Find verified startups based on revenue, growth, and more"
- Search bar and Add startup button

#### 2.2 Filter Panel (Left Sidebar)

**Available Filters:**

- **Categories**: Multi-select dropdown
- **Monthly Revenue (MRR)**: Min and Max range inputs
- **Total Revenue**: Min and Max range inputs
- **Growth (30d %)**: Min and Max percentage inputs
- **X Followers**: Min and Max range inputs
- **Founded Year**: From and To year inputs
- **Target Audience**: B2B and B2C checkboxes

#### 2.3 Results Section

- Results count display (e.g., "Found 1515 startups")
- Sort by dropdown (Total Revenue, MRR, Growth, etc.)
- Grid display of startup cards showing:
  - Logo
  - Name
  - Description
  - Category tag
  - Revenue metric (Total revenue or GMV)
  - Amount
  - Multiple displayed per row (3 columns)
- "FOR SALE" badge for startups listed for acquisition
- Pagination controls at bottom

#### 2.4 Clear Filters Button

- Appears when no results found
- Resets all filters

***

### 3. Startup Detail Page (`/startup/[slug]`)

#### 3.1 Header Section

- Breadcrumb navigation (TrustMRR > Startup > [Name])
- Startup logo (large)
- Startup name
- Description tagline
- **Share** button
- **Visit** button (links to startup website with referral tracking)

#### 3.2 Key Metrics Cards (4 Cards)

**Total Revenue Card:**

- Amount
- Rank number (#232)
- MoM growth percentage with indicator

**MRR (Estimated) Card:**

- Amount
- Active subscriptions count

**Founder Card:**

- Profile picture
- Name (clickable to founder page)
- X followers count

**Founded Card:**

- Month and Year
- Category tag (e.g., Analytics)
- Country flag and name

#### 3.3 Revenue Chart

- Time-series line chart
- Metric selector: Revenue (default) or other metrics
- Time period selector: Last 4 weeks, custom periods
- Hover tooltip showing date and amount
- X-axis: dates
- Y-axis: revenue amounts

#### 3.4 Verification Badge

- "Revenue is verified with a Stripe API key"
- Last updated timestamp

#### 3.5 Action Buttons

- **Embed**: Generate embed code
- **Edit / Delete**: For startup owner

#### 3.6 Related Startups Section

- "Discover more startups" header
- "Advanced Search" link
- Grid of 3 related startup cards
- Shows startups in same category or similar metrics
- "FOR SALE" badge where applicable

***

### 4. Founder Profile Page (`/founder/[username]`)

#### 4.1 Header

- Breadcrumb: TrustMRR > Founder > [Name]
- Profile picture (large)
- Name
- Startup count and X followers count
- **Share** button
- **Visit X profile** button

#### 4.2 Summary Metrics (4 Cards)

- **Total Revenue**: Across all startups
- **Last 30 days**: Recent revenue
- **Total MRR (estimated)**: Across all startups
- **Startups**: Count of active startups

#### 4.3 Startups Portfolio

- "Startups by @[username]" section
- Grid layout of startup cards (3 per row)
- Each card shows:
  - Logo
  - Name
  - Tagline
  - Total revenue

#### 4.4 Revenue Updates Feed

- Timeline of recent revenue milestones
- X post embeds showing founder's revenue updates
- Timestamp for each update

***

### 5. Statistics Page (`/stats`)

#### 5.1 Header

- Title: "Startup Statistics"
- Subtitle: "Live data from $1,184,388,133 verified revenue across 454 transactions"
- Search bar and Add startup button

#### 5.2 Distribution Cards (Top Row)

**Revenue Distribution Card:**

- Bar chart showing startup count by revenue bracket
- Brackets: $0-$1k, $1k-$10k, $10k-$100k, $100k-$1m, $1m+
- Percentages for each bracket

**Time to Growth Card:**

- Bar chart showing months to reach revenue milestones
- Milestones: $0 to $1, $1 to $1k, $1k to $10k, $10k to $100k, $100k to $1m, $1m+ to $1m
- Time ranges for each milestone

**Founder X Followers Card:**

- Distribution of founders by follower count
- Ranges: 0-1K, 1K-10K, 10K-100K, 100K+, Unknown
- Percentages for each range

#### 5.3 Scatter Plot Charts

**Revenue vs X Followers:**

- Interactive scatter plot
- Each point represents a startup (with founder avatar)
- X-axis: X followers (log scale toggle)
- Y-axis: Revenue (log scale toggle)
- Hover shows startup name and metrics

**Revenue vs Time in Business:**

- Interactive scatter plot
- Each point represents a startup (with logo)
- X-axis: Time in business (log scale toggle)
- Y-axis: Revenue (log scale toggle)
- Shows correlation between business age and revenue

#### 5.4 Global Revenue Map

- World map visualization
- Countries shaded by total startup revenue
- Darker shading = higher revenue
- Interactive hover to see country details

***

### 6. Acquisition Page (`/acquire`)

#### 6.1 Header

- Title: "Acquire Profitable Startups"
- Subtitle: "Browse verified startups looking for a buyer. All revenue metrics are pulled directly from Stripe/LemonSqueezy."
- **Sell startup** button

#### 6.2 Filter Panel (Left Sidebar)

**Filters:**

- **Categories**: Multi-select dropdown
- **Monthly Revenue**: Min and Max inputs
- **Asking Price**: Min and Max inputs
- **Max Multiple**: Input field (e.g., "Any multiple")

#### 6.3 Listings Grid

- Results count (e.g., "198 startups found")
- Sort dropdown: "Best deals (default)"
- Grid of startup acquisition cards (2 per row)
- Each card displays:
  - "FOR SALE" badge (when applicable)
  - Logo
  - Name
  - Category tag
  - Description
  - **Revenue (MRR)**: Amount
  - **Asking Price**: Amount
  - **Multiple**: Revenue multiple (e.g., "1.2x", "0.7x")
  - View count and bookmark count icons

***

### 7. Game Page (`/game`)

#### 7.1 Game Interface

- Title: "$1 vs $1,000,000 Startup"
- Warren Buffett character illustration
- Speech bubble with prompt
- **Start Game** button (large, centered)
- Footer: "All rookie investors playing right now 👋"

#### 7.2 Game Mechanics (Inferred)

- Users guess which of two startups has higher revenue
- Binary choice game format
- Gamification to engage users with the database

***

### 8. Newsletter Page (`/newsletter`)

#### 8.1 Signup Form

- Title: "Spot the Next Big Thing"
- Subtitle: "Join 1,000+ founders getting the weekly newsletter"
- Unicorn mascot graphic
- "Join the Herd" section with "No spam. Just pure startup juice."

#### 8.2 Newsletter Content Preview

**Includes:**

- 📈 **5 Fastest Growing Startups**: Tracking velocity, not just total revenue
- 💰 **3 Great Startup Deals**: SaaS and AI startups for sale with good multiple
- 🏆 **1 Underdog Spotlight**: Discover indie hackers who quit their job because they hit $5k MRR

#### 8.3 Email Input

- Email field
- "Send me the data" CTA button
- Social proof: "500+ entrepreneurs are already subscribed"

***

### 9. Open Revenue Feed (`/open`)

#### 9.1 Header

- Title: "Verified Open Revenue"
- Explanation: "To be verified, you must have at least 1 verified startup on TrustMRR and your X post must contain 'I made' and '$' sign. Updated every 3 hours."
- Search bar and Add startup button

#### 9.2 Revenue Updates Feed

- X post embeds showing revenue updates
- Each post shows:
  - User avatar and handle
  - Timestamp
  - Revenue claim text
  - Engagement metrics (replies, retweets, likes, views)
- **VERIFIED** badge for authenticated posts
- Green highlight for verified posts
- Standard feed layout for unverified posts

***

### 10. Olympics/Championship Page (`/championship`)

#### 10.1 Header

- Title: "Startup Olympics"
- Search bar and Add startup button

#### 10.2 Country Leaderboard

- Ranked list of countries by total startup revenue
- Each country section shows:
  - Rank number
  - Country flag and name
  - Number of startups
  - Total revenue amount
  - Expandable list of top startups from that country
  - Each startup shows:
    - Logo
    - Name
    - Percentage of country's total revenue
    - Progress bar visualization
    - Revenue amount

***

### 11. Recently Added Page (`/recent`)

#### 11.1 Header

- Title: "Recently Added"
- Subtitle: "Discover the latest startups joining the open startup movement."
- **Add startup** button

#### 11.2 Startup Feed

- Timeline-style layout
- Each entry shows:
  - Time added (e.g., "41 minutes ago", "46 minutes ago")
  - Startup card with:
    - Logo
    - Name
    - Founder (profile pic and name)
    - Description
    - Category tag
    - Revenue metric
    - MRR metric

***

### 12. Category Pages (`/category/[category]`)

#### Features (Inferred)

- Filtered view of startups by specific category
- Same layout as homepage leaderboard
- Category-specific header
- All category tags are clickable throughout the site

***

### 13. Add Startup Modal/Flow

#### Form Fields (Inferred)

- Startup name
- Description
- Website URL
- Category selection
- Founder information
- API key connection (Stripe/LemonSqueezy/Polar)
- X/Twitter handle
- Country/location
- Founded date
- Logo upload
- Listing type (standard or for sale)
- If for sale: asking price

***

## Technical Features

### 1. Revenue Verification System

- **API Integrations**: Stripe, LemonSqueezy, Polar
- **Update Frequency**: Hourly data refresh
- **Verification Badge**: Visual indicator on verified startups
- **Real-time Metrics**: MRR, total revenue, growth rates

### 2. Data Visualization

- Interactive charts (revenue over time)
- Scatter plots with log scale toggle
- Bar charts for distributions
- World map with revenue heatmap
- Progress bars for relative comparisons

### 3. Search & Filter System

- Global search across startups, founders, categories
- Advanced filtering by multiple criteria
- Real-time results count
- Sorting options (revenue, growth, etc.)
- URL parameter support for shareable searches

### 4. Social Integration

- X/Twitter profile linking
- X follower count display
- Embedded X posts in revenue feed
- Founder social proof metrics

### 5. User Engagement Features

- Share buttons on startup and founder pages
- Embed codes for startup pages
- Gamification (game page)
- Newsletter integration
- Bookmark/save functionality (inferred from icons)

### 6. Marketplace Features

- For-sale listings with "FOR SALE" badges
- Asking price and multiple calculations
- Revenue verification for acquisition due diligence
- Separate acquisition page

### 7. Referral & Tracking

- Referral parameter on "Visit" buttons
- Sponsor card system (sidebar ads)
- UTM tracking for outbound links

### 8. Responsive Design

- Grid layouts (3-column on desktop, responsive)
- Card-based UI components
- Mobile-friendly navigation
- Sidebar sponsor cards

### 9. Analytics & Insights

- Revenue distribution analysis
- Growth timeline visualization
- Country-based rankings
- Founder success metrics

***

## UI Components Library

### Reusable Components

1. **Startup Card**: Logo, name, description, metrics
2. **Founder Card**: Avatar, name, X followers
3. **Metric Card**: Title, value, change indicator
4. **Filter Panel**: Multi-select, range inputs, checkboxes
5. **Chart Component**: Line, bar, scatter, map
6. **Navigation Bar**: Logo, links, search, CTA
7. **Footer**: Links, attribution, theme toggle
8. **Modal**: Add startup, embed code, etc.
9. **Badge**: Verification, for-sale, category tags
10. **Button**: Primary, secondary, icon buttons
11. **Table**: Sortable columns, pagination
12. **Feed Item**: X post embed styling
13. **Progress Bar**: Percentage visualization
14. **Sponsor Card**: Logo, name, description, CTA

***

## Data Models

### Startup Entity

- ID
- Name
- Slug
- Description
- Logo URL
- Website URL
- Category (one or multiple)
- Founder ID (reference)
- Country
- Founded date
- Total revenue
- MRR (estimated)
- MoM growth percentage
- Active subscriptions count
- API verification status
- Verification source
