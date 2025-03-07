#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
check_env() {
    echo -e "\n${YELLOW}Checking .env file...${NC}"
    if [ -f .env ]; then
        echo -e "${GREEN}✓ .env file exists${NC}"
        # Check for required variables
        required_vars=("NEXT_PUBLIC_API_URL" "DATABASE_URL" "REDIS_URL")
        for var in "${required_vars[@]}"; do
            if grep -q "^${var}=" .env; then
                echo -e "${GREEN}✓ $var is set${NC}"
            else
                echo -e "${RED}✗ $var is missing${NC}"
                exit 1
            fi
        done
    else
        echo -e "${RED}✗ .env file not found${NC}"
        exit 1
    fi
}

# Check PostgreSQL
check_postgres() {
    echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
    if systemctl is-active --quiet postgresql; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
        # Try to connect
        if psql -U postgres -c '\l' > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PostgreSQL connection successful${NC}"
        else
            echo -e "${RED}✗ Cannot connect to PostgreSQL${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ PostgreSQL is not running${NC}"
        exit 1
    fi
}

# Check Redis
check_redis() {
    echo -e "\n${YELLOW}Checking Redis...${NC}"
    if systemctl is-active --quiet redis; then
        echo -e "${GREEN}✓ Redis is running${NC}"
        # Try to connect
        if redis-cli ping > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Redis connection successful${NC}"
        else
            echo -e "${RED}✗ Cannot connect to Redis${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Redis is not running${NC}"
        exit 1
    fi
}

# Check Node modules
check_node_modules() {
    echo -e "\n${YELLOW}Checking node_modules...${NC}"
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓ node_modules exists${NC}"
    else
        echo -e "${RED}✗ node_modules not found${NC}"
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
}

# Main execution
echo -e "${YELLOW}Starting infrastructure check...${NC}"

check_env
check_postgres
check_redis
check_node_modules

echo -e "\n${GREEN}All infrastructure checks passed!${NC}"
echo -e "${YELLOW}You can now run:${NC}"
echo -e "npm run test:infrastructure" 