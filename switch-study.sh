#!/bin/bash

# Study Management Script
# Usage: ./switch-study.sh [study1|study2]

STUDY=${1:-study1}

echo "Switching to $STUDY configuration..."

# Copy the appropriate .env file
cp .env.$STUDY .env

echo "Environment set to $STUDY"
echo "Database: truman_$STUDY"
echo "Input folder: ./input/$STUDY"

# Show next steps
echo ""
echo "Next steps:"
echo "1. Run: node populate.js"
echo "2. Run: npm start"
echo "3. Access: http://localhost:3000/staticvideo?speaker=1&mo=1"
