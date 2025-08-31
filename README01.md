# Smart Parking Management System

A comprehensive full-stack parking management solution built with the MERN stack, featuring real-time slot monitoring, booking management, and administrative controls.

## 🚀 Features

### User Features
- **Real-time Parking Availability**: Live updates of parking slot status
- **Smart Booking System**: Reserve parking slots with time-based pricing
- **Interactive Parking Map**: Visual representation of parking areas
- **Booking History**: Track past and current reservations
- **Profile Management**: Update personal information and preferences

### Admin Features
- **Dashboard Analytics**: Real-time statistics and insights
- **Slot Management**: Add, edit, and monitor parking slots
- **Booking Oversight**: View and manage all user bookings
- **User Management**: Admin controls for user accounts
- **Revenue Tracking**: Financial analytics and reporting

### Technical Features
- **Real-time Updates**: Socket.io integration for live data
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **JWT Authentication**: Secure user authentication system
- **RESTful API**: Well-structured backend API
- **MongoDB Integration**: Scalable database solution

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Socket.io-client for real-time features
- Axios for API calls
- React Hook Form for form handling

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.io for real-time communication
- bcryptjs for password hashing
- CORS for cross-origin requests

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas account** (free cluster)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <your-repository-url>
cd smart-parking-system
\`\`\`

### 2. Backend Setup

\`\`\`bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
\`\`\`

### 3. Configure Environment Variables

Edit `server/.env` with your MongoDB cluster details:

\`\`\`env
# MongoDB Configuration (Replace with your cluster details)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173
\`\`\`

**MongoDB Setup Instructions:**
1. Log into your MongoDB Atlas account
2. Go to your cluster dashboard
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<database-name>` with your actual values

### 4. Frontend Setup

\`\`\`bash
# Navigate to client directory (from root)
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
\`\`\`

Edit `client/.env`
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
\`\`\`

### 5. Database Seeding (Optional)

\`\`\`bash
# From server directory
npm run seed
\`\`\`

This will create sample parking slots and an admin user:
- **Admin Email**: admin@parking.com
- **Admin Password**: admin123

### 6. Start the Application

**Terminal 1 - Backend:**
\`\`\`bash
cd server
npm run dev
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
cd client
npm run dev
\`\`\`

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📱 Usage Guide

### For Users

1. **Registration/Login**
   - Create an account or login with existing credentials
   - Access the user dashboard

2. **Finding Parking**
   - Browse available slots in the "Find Parking" section
   - Use filters to find slots by location, price, or availability
   - View real-time slot status on the interactive map

3. **Making Reservations**
   - Select desired time slot and duration
   - Confirm booking details and pricing
   - Receive booking confirmation

4. **Managing Bookings**
   - View active and past bookings in "My Bookings"
   - Cancel upcoming reservations if needed
   - Track booking history and expenses

### For Administrators

1. **Admin Access**
   - Login with admin credentials
   - Access admin dashboard with elevated permissions

2. **Dashboard Overview**
   - Monitor real-time occupancy rates
   - View revenue analytics and trends
   - Track user activity and system performance

3. **Slot Management**
   - Add new parking slots with location and pricing
   - Edit existing slot details and availability
   - Monitor slot utilization patterns

4. **Booking Management**
   - View all system bookings in real-time
   - Manage booking conflicts and issues
   - Generate booking reports and analytics

## 🔧 API Documentation

### Authentication Endpoints

\`\`\`
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update user profile
\`\`\`

### Parking Slots Endpoints

\`\`\`
GET    /api/slots          # Get all slots
POST   /api/slots          # Create new slot (Admin)
PUT    /api/slots/:id      # Update slot (Admin)
DELETE /api/slots/:id      # Delete slot (Admin)
GET    /api/slots/available # Get available slots
\`\`\`

### Booking Endpoints

\`\`\`
GET    /api/bookings       # Get user bookings
POST   /api/bookings       # Create new booking
PUT    /api/bookings/:id   # Update booking
DELETE /api/bookings/:id   # Cancel booking
GET    /api/bookings/admin # Get all bookings (Admin)
\`\`\`

### User Management Endpoints

\`\`\`
GET    /api/users          # Get all users (Admin)
PUT    /api/users/:id      # Update user (Admin)
DELETE /api/users/:id      # Delete user (Admin)
\`\`\`

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. **Environment Variables**
   \`\`\`env
   MONGODB_URI=<your-production-mongodb-uri>
   JWT_SECRET=<strong-production-secret>
   NODE_ENV=production
   CLIENT_URL=<your-frontend-domain>
   \`\`\`

2. **Build Command**: `npm install`
3. **Start Command**: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Environment Variables**
   \`\`\`env
   VITE_API_URL=<your-backend-domain>/api
   VITE_SOCKET_URL=<your-backend-domain>
   \`\`\`

2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: API rate limiting for abuse prevention
- **Environment Variables**: Sensitive data stored securely

## 🧪 Testing

\`\`\`bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
\`\`\`

## 📊 Performance Optimization

- **Database Indexing**: Optimized MongoDB queries
- **Real-time Updates**: Efficient Socket.io event handling
- **Lazy Loading**: Component-based code splitting
- **Caching**: Strategic API response caching
- **Compression**: Gzip compression for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Verify your connection string in `.env`
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

**CORS Errors:**
- Verify `CLIENT_URL` in server `.env`
- Check if frontend URL matches the CORS configuration

**Socket.io Connection Issues:**
- Ensure both frontend and backend are running
- Check if `VITE_SOCKET_URL` points to correct backend URL

**Build Errors:**
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify all environment variables are set

### Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs for error details
3. Ensure all environment variables are correctly configured
4. Verify MongoDB cluster connectivity

## 📞 Support

For additional support or questions:
- Create an issue in the repository
- Check existing documentation
- Review the API endpoints and usage examples

---

**Happy Parking! 🚗**
