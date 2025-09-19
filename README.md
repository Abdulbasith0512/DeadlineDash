# DeadlineDASH - Student Assignment Management System

A comprehensive web application for students to manage their assignments, courses, and deadlines with MongoDB backend and email OTP verification.

## Features

- ✅ **User Authentication** with JWT tokens
- ✅ **Email OTP Verification** for registration and password reset
- ✅ **Assignment Management** with CRUD operations
- ✅ **Course Management** with color coding
- ✅ **Calendar View** with monthly and list views
- ✅ **Statistics Dashboard** with progress tracking
- ✅ **MongoDB Integration** for data persistence
- ✅ **Responsive Design** for mobile and desktop

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcryptjs
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `config.env` file in the root directory based on the provided `.env.example` file:

```env
# Copy the contents from .env.example and replace with your actual credentials
# DO NOT commit your actual credentials to the repository
```

The `.env.example` file contains all the required environment variables with placeholder values. Replace these with your actual credentials for:

- MongoDB connection string
- JWT secret key
- Twilio credentials (for SMS notifications)
- Other configuration settings

### 3. Start the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### Security Note

This repository is configured with security best practices:

- Sensitive files like `config.env` and `.env` are included in `.gitignore` to prevent accidental commits
- Use `.env.example` as a template for required environment variables without exposing actual credentials
- Never commit actual credentials to the repository
- If you accidentally commit sensitive information, follow proper steps to remove it from the repository history

## Deployment

For detailed deployment instructions, please refer to the [DEPLOYMENT.md](./DEPLOYMENT.md) file. The application can be deployed to various platforms including:

- **Render** (recommended for free tier)
- **Railway**
- **Fly.io**
- **Heroku**

Each platform has its own configuration requirements, which are documented in the deployment guide.
```

### 3. Twilio Setup

1. **Create a Twilio Account**:
   - Go to [twilio.com](https://www.twilio.com) and sign up
   - Get your Account SID and Auth Token from the dashboard

2. **Get a Twilio Phone Number**:
   - In your Twilio console, go to Phone Numbers → Manage → Buy a number
   - Choose a number that supports SMS

3. **Update config.env file** with your Twilio credentials:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_PHONE_NUMBER`: Your Twilio phone number (format: +1234567890)

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send registration OTP
- `POST /api/auth/verify-otp` - Verify OTP and register
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Send password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Users

- `GET /api/users/stats` - Get user statistics
- `PUT /api/users/settings` - Update user settings
- `DELETE /api/users/account` - Delete user account

### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get specific course
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/:id/stats` - Get course statistics

### Assignments

- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get specific assignment
- `POST /api/assignments` - Create new assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment
- `GET /api/assignments/stats/summary` - Get assignment statistics

## Database Models

### User
- Email, password, full name
- Profile information (student ID, major, year, etc.)
- Settings (dark mode, email reminders, etc.)
- Timestamps and last login

### Course
- Name, code, instructor
- Color coding for visual distinction
- Credits, semester, year
- User association

### Assignment
- Title, description, type
- Due date, priority, status
- Progress tracking
- Course association
- Attachments and notes

### OTP
- Email, OTP code, purpose
- Expiration time (10 minutes)
- Usage tracking

## Email Templates

The application includes beautiful HTML email templates for:
- **Registration OTP**: Welcome email with verification code
- **Password Reset OTP**: Password reset request with verification code

## Security Features

- **JWT Authentication** with 7-day expiration
- **Password Hashing** with bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet Security Headers**
- **Input Validation** and sanitization
- **OTP Expiration** (10 minutes)

## Frontend Integration

The frontend JavaScript files need to be updated to use the API endpoints instead of localStorage. Key changes:

1. **Authentication**: Use `/api/auth/*` endpoints
2. **Data Storage**: Replace localStorage with API calls
3. **Token Management**: Store JWT tokens in localStorage
4. **Error Handling**: Handle API responses and errors

## Development

### Project Structure

```
deadline-dash-final/
├── models/           # MongoDB schemas
├── routes/           # API route handlers
├── middleware/       # Authentication middleware
├── services/         # Email service
├── utils/           # OTP utilities
├── css/             # Stylesheets
├── js/              # Frontend JavaScript
├── *.html           # Frontend pages
├── server.js        # Express server
├── package.json     # Dependencies
└── README.md        # This file
```

### Adding New Features

1. **Database**: Create new models in `models/`
2. **API**: Add routes in `routes/`
3. **Frontend**: Update JavaScript files
4. **Email**: Add templates in `services/emailService.js`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Check your connection string
   - Ensure network access is enabled in MongoDB Atlas

2. **Email Not Sending**:
   - Verify Gmail credentials in `.env`
   - Check if 2FA and app password are set up correctly
   - Ensure "Less secure app access" is disabled

3. **OTP Not Working**:
   - Check email service configuration
   - Verify OTP expiration time
   - Check MongoDB connection for OTP storage

### Logs

The server provides detailed logging for:
- Database connections
- Email sending status
- API requests and errors
- OTP generation and verification

## License

MIT License - feel free to use this project for educational purposes.

## Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.
