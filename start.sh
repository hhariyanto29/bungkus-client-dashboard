#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Bungkus Admin Dashboard - Start Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to start backend
start_backend() {
    echo -e "\n${YELLOW}Starting Backend Server...${NC}"
    
    if port_in_use 3001; then
        echo -e "${YELLOW}Port 3001 is already in use. Checking if it's our backend...${NC}"
        if curl -s http://localhost:3001/health >/dev/null 2>&1; then
            echo -e "${GREEN}Backend is already running on port 3001${NC}"
            return 0
        else
            echo -e "${RED}Port 3001 is in use by another process${NC}"
            return 1
        fi
    fi
    
    cd backend
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    npm install
    
    echo -e "${BLUE}Starting backend server...${NC}"
    npm run dev &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo -e "${YELLOW}Waiting for backend to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3001/health >/dev/null 2>&1; then
            echo -e "${GREEN}Backend started successfully!${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}Backend failed to start${NC}"
    return 1
}

# Function to start frontend
start_frontend() {
    echo -e "\n${YELLOW}Starting Frontend Application...${NC}"
    
    if port_in_use 3000; then
        echo -e "${YELLOW}Port 3000 is already in use. Checking if it's our frontend...${NC}"
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${GREEN}Frontend is already running on port 3000${NC}"
            return 0
        else
            echo -e "${RED}Port 3000 is in use by another process${NC}"
            return 1
        fi
    fi
    
    cd admin
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
    
    echo -e "${BLUE}Starting frontend development server...${NC}"
    npm start &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    echo -e "${YELLOW}Waiting for frontend to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${GREEN}Frontend started successfully!${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}Frontend failed to start${NC}"
    return 1
}

# Function to display URLs
display_urls() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}   Application URLs${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
    echo -e "${BLUE}Backend API:${NC} http://localhost:3001"
    echo -e "${BLUE}Backend Health:${NC} http://localhost:3001/health"
    echo -e "\n${YELLOW}Default Admin Credentials:${NC}"
    echo -e "Email: admin@bungkus.com"
    echo -e "Password: admin123"
    echo -e "\n${GREEN}========================================${NC}"
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down applications...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${BLUE}Stopping backend...${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${BLUE}Stopping frontend...${NC}"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    echo -e "${GREEN}Applications stopped${NC}"
    exit 0
}

# Trap Ctrl+C for cleanup
trap cleanup SIGINT SIGTERM

# Check for required commands
if ! command_exists node; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v16 or higher.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}npm is not installed. Please install npm.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}Node.js version 16 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi

# Start applications
echo -e "\n${BLUE}Starting Bungkus Admin Dashboard...${NC}"

# Start backend
if ! start_backend; then
    echo -e "${RED}Failed to start backend${NC}"
    exit 1
fi

# Start frontend
if ! start_frontend; then
    echo -e "${RED}Failed to start frontend${NC}"
    cleanup
    exit 1
fi

# Display URLs
display_urls

echo -e "\n${YELLOW}Press Ctrl+C to stop the applications${NC}"

# Keep script running
wait