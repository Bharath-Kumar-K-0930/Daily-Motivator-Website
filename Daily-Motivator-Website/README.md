# Login System

This is a simple login system for users and admins built with Node.js, Express, and MongoDB.

## Features

- User registration with MongoDB storage
- User login with credential validation against MongoDB
- Admin login with hardcoded credentials
- Passwords stored in plain text (for demonstration purposes only; not secure)
- Static files served from the `public` directory
- Environment variable support for MongoDB connection string

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running locally or accessible via connection string

## Installation

1. Clone the repository or download the project files.

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with the following content:

```
MONGODB_URI=mongodb://localhost:27017/loginSystem
```

Replace the URI with your MongoDB connection string if different.

## Running the Project

Start the server with:

```bash
npm start
```

The server will run on [http://localhost:3002](http://localhost:3002) (or the port specified in `server.js`).

## Usage

- Access the user login page at: `http://localhost:3002/loginpage.html`
- Access the user registration page at: `http://localhost:3002/register.html`
- Access the admin login page at: `http://localhost:3002/adminlogin.html`

## Notes

- Passwords are stored in plain text for simplicity. For production, use password hashing.
- The admin login uses hardcoded credentials (`admin` / `admin123`).
- Make sure MongoDB is running before starting the server.

## Dependencies

- express
- body-parser
- mongoose
- nodemon
- dotenv

## License

This project is for demonstration purposes only.
