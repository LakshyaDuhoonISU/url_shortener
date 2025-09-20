# URL Shortener

A full-stack URL shortener application built with React (frontend) and Node.js/Express (backend), featuring user authentication, analytics, and comprehensive URL management.

![Login Page](<Screenshot 2025-09-20 at 16.17.13.png>)
![Register Page](<Screenshot 2025-09-20 at 16.17.24.png>)
![404 Page](<Screenshot 2025-09-20 at 16.18.33.png>)
![URL creation](<Screenshot 2025-09-20 at 16.18.56.png>)
![Dashboard](<Screenshot 2025-09-20 at 16.19.15.png>)
![URL search](<Screenshot 2025-09-20 at 16.19.26.png>)
![URL edit](<Screenshot 2025-09-20 at 16.19.26-1.png>)
![URL statistics](<Screenshot 2025-09-20 at 16.19.57.png>)

## 📋 Features

### 🔐 Authentication

- User registration and login with JWT tokens
- Persistent authentication (survives page refresh)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 🔗 URL Management

- Shorten URLs with auto-generated or custom slugs
- Edit URL titles and descriptions
- Enable/disable URLs
- Permanent URL deletion with confirmation
- Copy to clipboard functionality
- Open shortened URLs in new tab

### 📊 Analytics & Statistics

- Click tracking with detailed analytics
- Geographic location tracking
- Device type and browser detection
- Operating system analytics
- Date range filtering for statistics
- Real-time click counting

### 🎨 User Interface

- Responsive design with Tailwind CSS
- Modern UI components with Headless UI
- Toast notifications for user feedback
- Search functionality for URLs
- Pagination for large URL collections
- Modal dialogs for editing and statistics

## 🛠️ Tech Stack

### Frontend

- **React** 18.2.0 - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled UI components
- **Heroicons** - Icon library
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **UA Parser** - User agent parsing
- **ShortID** - URL code generation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/LakshyaDuhoonISU/url_shortener.git
   cd url_shortener
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Environment Setup**

   Create a `.env` file in the `backend` directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/url_shortener
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/url_shortener

   # JWT Secret (use a strong, random string)
   JWT_SECRET=your_super_secure_jwt_secret_key_here

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Base URL for shortened links
   BASE_URL=http://localhost:3001
   ```

2. **Frontend Environment Setup (Optional)**

   Create a `.env` file in the `frontend` directory if needed:

   ```env
   VITE_API_URL=http://localhost:3001
   ```

### Database Setup

1. **Local MongoDB**

   - Install MongoDB locally
   - Start MongoDB service
   - The application will automatically create the database and collections

2. **MongoDB Atlas (Cloud)**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get the connection string
   - Update `MONGODB_URI` in your `.env` file

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server**

   ```bash
   cd backend
   npm start
   ```

   The backend will run on `http://localhost:3001`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Production Mode

1. **Build the frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

## 📁 Project Structure

```
url_shortener/
├── backend/
│   ├── middleware/          # Authentication middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Helper utilities
│   ├── .env                # Environment variables
│   ├── .gitignore         # Git ignore rules
│   ├── package.json       # Dependencies and scripts
│   └── server.js          # Main server file
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main App component
│   ├── .env               # Environment variables
│   ├── .gitignore        # Git ignore rules
│   ├── package.json      # Dependencies and scripts
│   └── vite.config.js    # Vite configuration
└── README.md
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### URL Management

- `GET /api/url/my-urls` - Get user's URLs with pagination
- `POST /api/url/shorten` - Create a shortened URL
- `PUT /api/url/:id` - Update URL details
- `DELETE /api/url/:id` - Delete a URL
- `PUT /api/url/:id/enable` - Enable a URL
- `PUT /api/url/:id/disable` - Disable a URL

### Analytics

- `GET /api/url/:id/stats` - Get URL statistics
- `POST /api/url/:id/click` - Track a click (internal)

### URL Redirection

- `GET /:shortCode` - Redirect to original URL

## 🌟 Usage

1. **Register/Login**: Create an account or sign in
2. **Create URLs**: Enter a long URL to get a shortened version
3. **Manage URLs**: Edit titles, descriptions, enable/disable, or delete URLs
4. **View Analytics**: Click the chart icon to see detailed statistics
5. **Share URLs**: Copy the shortened URL or open it in a new tab

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure MongoDB is running
3. Verify environment variables are set correctly
4. Check that both servers are running on the correct ports

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway)

1. Set environment variables on your hosting platform
2. Deploy the backend code
3. Update `BASE_URL` to your production domain

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build the frontend with `npm run build`
2. Deploy the `dist` folder
3. Update API endpoints to point to your production backend

---

Made with ❤️ using React and Node.js
