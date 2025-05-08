# VHS Collector App

A web and mobile-friendly application designed for VHS collectors to organize their personal collections and maintain a wantlist of desired tapes. Inspired by platforms like PriceCharting, but focused entirely on VHS media and without price tracking—just clean, community-friendly collection management.

## 📌 Features (Planned)

### 🔐 User Accounts
- Sign up / Log in
- Secure authentication
- Personalized dashboard

### 📼 Collection Management
- Add tapes to your collection
- Include details like condition, format, release year, label, and notes
- Upload custom cover images or photos
- Group or tag entries for better organization

### 📋 Wantlist Tracking
- Maintain a separate list of tapes you're hunting for
- Prioritize items with custom notes
- Easily transfer items between wantlist and collection

### 🔍 Search & Browse
- Search tapes from a growing global VHS catalog
- Filter by genre, label, format, or year
- Smart auto-suggestions as you type

## 🛠️ Tech Stack (Planned)

- **Frontend**: React or Vue.js (TBD)
- **Backend**: Node.js with Express or Django (TBD)
- **Database**: PostgreSQL
- **Auth**: JWT-based authentication
- **Hosting**: TBD (e.g., Vercel, Netlify, or Heroku)

## 🧱 Database Schema Overview

### Tables:
- `Users`: Stores user account information
- `VHS_Tapes`: Master catalog of VHS tapes
- `User_Collections`: Tracks user-owned tapes
- `User_Wantlist`: Tracks user wishlists

(Relational schema designed to support flexible data entry and future scalability.)

## 💡 Future Enhancements

- Barcode scanning (if barcodes are available)
- Community features (trade, share collections)
- eBay integration for optional price lookup
- Export/import collections (CSV, JSON)
- Admin moderation for new tape submissions

## 🚧 Status

This project is in the planning phase. Database schema and feature list are being refined, with development scheduled to begin soon.

## 📄 License

MIT License (or TBD)

---

_Interested in helping out or making suggestions? Feel free to fork, open issues, or get in touch!_
