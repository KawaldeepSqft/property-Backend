# FROM node:alpine3.18
# WORKDIR /app
# COPY package.json ./
# RUN npm install
# COPY . .
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Define build argument for the PORT
ARG PORT

# Write the actual value of the PORT build argument to the .env file
RUN echo "PORT=$PORT" > .env


# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application code (including app.js in the root)
COPY . .

# Expose the port your app will run on
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]

