# 💎 GemSpot — Discover YouTube's Hidden Gems

> **A community-driven platform for discovering, upvoting, and celebrating underrated YouTube creators.**

GemSpot is a cross-platform mobile application built with **React Native (Expo)** and **Firebase** that connects viewers with small YouTube creators (under 50K subscribers). Viewers discover and upvote hidden-gem videos, while creators gain exposure through community-powered leaderboards — no algorithm required.

---

## 📋 Table of Contents

* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Architecture](#-architecture)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Firebase Setup](#-firebase-setup)
* [Available Scripts](#️-available-scripts)
* [Database Schema](#-database-schema)
* [Contributing](#-contributing)

---

## ✨ Features

### 👀 For Viewers

* Browse curated YouTube content
* Explore creators across categories
* Upvote favourite videos
* View community leaderboards
* Comment and engage
* Follow creators
* Earn streaks & badges
* Submit hidden gems

### 🎬 For Creators

* Creator dashboard & analytics
* Upload and manage content
* Track engagement metrics
* View subscriber insights
* Apply for brand deals
* Claim creator profiles

### 🛒 Creator Shop

Affiliate shop with creator gear (mics, cameras, etc.)

### 🔐 Authentication

* Email/password login
* Role-based access (Viewer / Creator)
* Persistent sessions

---

## 🛠 Tech Stack

* **Frontend:** React Native + Expo
* **Language:** TypeScript
* **Backend:** Firebase (Auth, Firestore, Storage)
* **Navigation:** Expo Router
* **State Management:** Context API
* **APIs:** YouTube Data API v3

---

## 🏗 Architecture

* Role-based navigation (Viewer vs Creator)
* Service-layer abstraction for Firebase
* Centralized design system
* Denormalized Firestore data for performance

---

## 📁 Project Structure

```
gemSpot/
├── app/
├── components/
├── contexts/
├── services/
├── constants/
├── hooks/
├── assets/
├── scripts/
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (18+)
* npm (9+)
* Firebase project
* YouTube API key

### Installation

```bash
git clone https://github.com/your-username/gemSpot.git
cd gemSpot
npm install
```

### Run the app

```bash
npx expo start
```

---

## 🔑 Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_YOUTUBE_API_KEY=your_key
```

---

## 🔥 Firebase Setup

1. Create project in Firebase Console
2. Enable:

   * Authentication (Email/Password)
   * Firestore Database
   * Storage
3. Add credentials to `.env`

---

## 💾 Database Schema

Collections:

* users
* videos
* creators
* comments
* follows

---

