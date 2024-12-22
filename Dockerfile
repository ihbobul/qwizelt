# Use the official Node.js 14 image as a base image
FROM node:20.14-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port that the NestJS application will run on
EXPOSE 3000

# Command to run the NestJS application
CMD ["node", "dist/src/main"]