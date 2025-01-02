# Stack Overflow Project

Stack Overflow Project is a Node.js application built with Express.js, MongoDB, Passport.js, and JWT authentication.

## Requirements

• Docker

• Docker Compose

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/MahamdSirafi/stack-over-flow.git
   ```

2. **Install Dependencies**

   ```bash
   npm  install
   ```

3. **Set Up MongoDB**

   - Make sure MongoDB is installed and running on your machine.
   - If not installed, you can download and install it from MongoDB Official Website.
   - Start MongoDB service.

4. **Environment Variables**

   - Create a .env file in the root directory.
   - Add the following environment variables to the .env file:

   - ```makefile
     NODE_ENV=development/production
     PORT=3000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     JWT_ACCESS_EXPIRATION=jwt_expire_time
     LOG_DIR=./logs
     OPENAI_API_KEY=12d1d24d1s1d21dc12d12dd1d
     ```

5. **Run the Application**

```bash
npm run build
npm start
```

or

```bash
npm run build
npm start
```

5. **Run the Application with docker**
   To run the project in a production environment, use the following command:

```bash
docker-compose -f docker-compose-prod.yml up --build
```

To run the project in a development environment, use the following command:

```bash
docker-compose -f docker-compose-dev.yml up --build
```

## API Endpoints

### API Documentation

The API documentation for this project is available in the stack_overflow.postman_collection.json file located in the root directory of the project. This file contains a collection of all the API endpoints, including their descriptions, request methods, parameters, and example responses.

To explore the API documentation:

1. Open Postman.
2. Import the stack_overflow.postman_collection.json file.
3. You will find all the available API endpoints organized for easy navigation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
