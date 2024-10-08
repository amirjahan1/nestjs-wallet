# Dockerfile

# Use the latest Node.js version from the official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application source code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port for the NestJS app
EXPOSE 3000

# Start the NestJS application
CMD ["npm", "run", "start:prod"]
