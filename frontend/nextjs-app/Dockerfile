FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Expose port if needed (Next.js default is 3000)
EXPOSE 3000

CMD ["npm", "run", "dev"]
