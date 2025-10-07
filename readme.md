# 🧠 Chai Aur Backend

A complete backend project built while following **Hitesh Choudhary’s Chai aur Backend** series.  
This project demonstrates real-world backend development practices using **Node.js**, **Express**, and **MongoDB**, covering authentication, CRUD operations, file uploads, and more.

---

## 🚀 Features

- 🧩 **User Authentication & Authorization**
  - Register, login, logout with JWT tokens
  - Access & refresh token mechanism
  - Secure password hashing using bcrypt

- 🧾 **Video Management**
  - Upload, update, delete videos
  - Cloud storage integration (Cloudinary)
  - Like, dislike, comment functionality

- 👥 **User Profiles**
  - Update user details, avatar, and cover image
  - Follow / unfollow users
  - Get subscribed channels and subscriptions count

- 📺 **Playlists**
  - Create, update, and delete playlists
  - Add/remove videos in playlists

- 💬 **Comments & Likes**
  - Add, update, delete comments
  - Like/dislike on videos and comments

- 🧮 **Channel Analytics**
  - Total video views, likes, comments, and subscriber count

- ⚙️ **Robust Middleware**
  - Error handling with custom error classes
  - Authentication middleware for protected routes
  - Async handler wrapper for cleaner async/await code

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT (Access & Refresh Tokens) |
| File Storage | Cloudinary |
| Validation | Mongoose Validators & Custom Checks |
| Environment Config | dotenv |
| Utilities | multer (for file uploads), bcrypt, cookie-parser |

---

## 📁 Project Structure

```bash
chai-aur-backend/
├── src/
│ ├── controllers/ # Route controllers (User, Video, Playlist, Comment)
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Express route definitions
│ ├── middlewares/ # Auth, error handling, etc.
│ ├── utils/ # Helper functions (e.g., asyncHandler, ApiError, ApiResponse)
│ ├── config/ # DB and Cloudinary configuration
│ └── app.js # Express app setup
├── .env.example # Example environment variables
├── package.json
├── README.md
└── server.js # Entry point

```

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following:

```bash
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

```
---

#🧩 Installation & Setup

- Clone the repository
```bash
git clone https://github.com/https://github.com/ttushaar1906/videoProj.git

```
- Install dependencies

```bash
npm install
```

- Set up environment variables.
Create a .env file and fill in all required keys.

-Run the development server

```bash
npm run dev
```

- Visit API
```bash
http://localhost:8000/api/v1
```
---

# 🧠 Learnings from this Project

- Structured and scalable backend architecture

- Middleware-based authentication using JWT

- File handling with Cloudinary and Multer

- Clean controller-service pattern

- Database schema relationships and population

- API error handling and response standardization

---
# 💡 Author
**Tushar Tharwani**  
🔗 [GitHub Profile](https://github.com/ttushaar1906)

🔗 [Entity Relationship](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

