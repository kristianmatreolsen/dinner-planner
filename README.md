# 🍽️ Dinner Planner (WIP)

## 🚀 Getting Started

### 1. Clone the Repository:

	git clone https://github.com/kristianmatreolsen/dinner-planner.git
	cd dinner-planner
	
### 2. Install Dependencies

Make sure you have Node.js installed (recommended: latest LTS).

	npm install
	
or, if you use Yarn:
	
	yarn install


### 3️. Environment Setup
Create a .env file in the project root and add your Supabase credentials:

	const SUPABASE_URL = "https://yparzixzlngulxwecwsg.supabase.co";
	const SUPABASE_ANON_KEY= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYXJ6aXh6bG5ndWx4d2Vjd3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODE3MDUsImV4cCI6MjA5MDU1NzcwNX0.pq67VrlLt4TaZFNRGsiopPJPOtiDfJWDAYVd4JF767s";

If you want to use your own Supabase, these values can be found in your Supabase project settings.


### 4️. Run the App

Start the Expo development server:

	npm run start
Then:

- Press **w** to run on web

- Scan the QR code with Expo Go (iOS / Android) or run on an emulator

## 📦 Tech Stack

- React Native (Expo)

- Expo Router for navigation

- Supabase for backend, database, and data querying
  
- Ionicons / Icons8 assets for UI icons
  
- Fully supports light & dark themes

## 🗂️ Project Structure

	├── app/
	│   ├── (drawer)/        # Navigation layout
	│   ├── index.js         # Home screen
	│   ├── planner/         # Planner screens
	│   ├── recipes/         # Recipe screens
	│   ├── shopping/        # Shopping list
	│   └── settings/        # Settings	
	│
	├── components/
	│   ├── Footer.js        # Footer component
	│   └── (shared UI)
	│
	├── assets/
	│   ├── images/          # Logos & images
	│   └── icons/           # App & brand icons
	│
	├── lib/
	│   ├── supabase.js      # Supabase client
	│   └── theme/           # Theme context
	│
	├── README.md
	└── package.json

## 🍽️ Dinner Planner

Dinner Planner is a cross‑platform application built with React Native and Supabase that helps you plan dinners for the week, manage recipes, and generate shopping lists with minimal effort.
The goal of the app is to make everyday meal planning faster, more structured, and reusable — whether you're planning solo, for a family, or for multiple weeks ahead.


## ✨ Features & Modules

### 🏠 Homepage:

The **homepage** acts as a dashboard and inspiration hub:

- Overview of the app

- Top Recipes (most frequently used)

- Trending Dinners (recently planned recipes)

- Quick navigation into planning or recipe exploration



### 📆 Planner

The **planner** is the core of the application:

- Weekly dinner planner (Monday–Sunday)

- Add, edit, or remove dinners for each day

- Navigate between weeks (with limits to past/future weeks)

- Supports both saved recipes and custom dinners


### 📖 Recipes:

The **recipe** module lets you manage your recipe collection:

- Browse all saved recipes

- View individual recipes

- Add new recipes manually

- Re‑use recipes in the weekly planner

- Recipes are stored and managed via Supabase


### 🛒 Shopping List:

The **shopping list** consolidates planning into action:

- Generate a shopping list from planned meals

- Designed to remove friction between planning and grocery shopping

- (Expandable for future features such as quantities or categories)


### ⚙️ Settings:

The **settings** module provides:

- App preferences

- Theme handling (light/dark mode)

- Space for future personalization and account features

### 🎨 UI & Design Notes:

- Responsive layout (desktop, tablet, mobile)
- Dashboard‑style homepage
- Theme‑aware icons and components
- Clean separation of layout, logic, and presentation


### 📌 Useful Tips:

- The footer is non‑sticky and part of page content
- Business logic is intentionally kept inside screens
- Layout components are reusable and composable
- Supabase queries are centralized and easy to extend


### 🧪 Future Improvements (Ideas):

- Recipe images and rich recipe details
- Ingredient‑based shopping lists
- User authentication (Supabase Auth)
- Multi‑user / shared planning
- Export shopping lists (PDF / mobile notes)
