#!/bin/bash
# OpenRevenue Secret Generator
# Generates secure random secrets for production deployment

set -e

echo "🔐 OpenRevenue Secret Generator"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Secrets not generated."
        exit 1
    fi
fi

# Copy template
echo -e "${BLUE}📋 Copying environment template...${NC}"
cp .env.production.example .env.production

# Generate secrets
echo -e "${BLUE}🎲 Generating secure secrets...${NC}"
echo ""

# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✓${NC} NEXTAUTH_SECRET generated"

# Generate BETTER_AUTH_SECRET
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✓${NC} BETTER_AUTH_SECRET generated"

# Generate ENCRYPTION_KEY (64 chars)
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo -e "${GREEN}✓${NC} ENCRYPTION_KEY generated"

# Generate signing private key using Node.js
echo -e "${BLUE}🔑 Generating signing keys...${NC}"
SIGNING_PRIVATE_KEY=$(node -e "const nacl = require('tweetnacl'); const keypair = nacl.sign.keyPair(); console.log(Buffer.from(keypair.secretKey).toString('base64'));")
echo -e "${GREEN}✓${NC} SIGNING_PRIVATE_KEY generated"

# Generate standalone secrets
STANDALONE_JWT_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✓${NC} STANDALONE_JWT_SECRET generated"

STANDALONE_SESSION_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✓${NC} STANDALONE_SESSION_SECRET generated"

STANDALONE_SIGNING_PRIVATE_KEY=$(node -e "const nacl = require('tweetnacl'); const keypair = nacl.sign.keyPair(); console.log(Buffer.from(keypair.secretKey).toString('base64'));")
echo -e "${GREEN}✓${NC} STANDALONE_SIGNING_PRIVATE_KEY generated"

echo ""

# Replace in .env.production
echo -e "${BLUE}📝 Updating .env.production file...${NC}"

# macOS uses -i '' while Linux uses -i
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|g" .env.production
    sed -i '' "s|BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET|g" .env.production
    sed -i '' "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|g" .env.production
    sed -i '' "s|SIGNING_PRIVATE_KEY=.*|SIGNING_PRIVATE_KEY=$SIGNING_PRIVATE_KEY|g" .env.production
    sed -i '' "s|STANDALONE_JWT_SECRET=.*|STANDALONE_JWT_SECRET=$STANDALONE_JWT_SECRET|g" .env.production
    sed -i '' "s|STANDALONE_SESSION_SECRET=.*|STANDALONE_SESSION_SECRET=$STANDALONE_SESSION_SECRET|g" .env.production
    sed -i '' "s|STANDALONE_SIGNING_PRIVATE_KEY=.*|STANDALONE_SIGNING_PRIVATE_KEY=$STANDALONE_SIGNING_PRIVATE_KEY|g" .env.production
else
    # Linux
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|g" .env.production
    sed -i "s|BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET|g" .env.production
    sed -i "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|g" .env.production
    sed -i "s|SIGNING_PRIVATE_KEY=.*|SIGNING_PRIVATE_KEY=$SIGNING_PRIVATE_KEY|g" .env.production
    sed -i "s|STANDALONE_JWT_SECRET=.*|STANDALONE_JWT_SECRET=$STANDALONE_JWT_SECRET|g" .env.production
    sed -i "s|STANDALONE_SESSION_SECRET=.*|STANDALONE_SESSION_SECRET=$STANDALONE_SESSION_SECRET|g" .env.production
    sed -i "s|STANDALONE_SIGNING_PRIVATE_KEY=.*|STANDALONE_SIGNING_PRIVATE_KEY=$STANDALONE_SIGNING_PRIVATE_KEY|g" .env.production
fi

echo -e "${GREEN}✅ Secrets generated successfully!${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📌 Next Steps:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Edit .env.production and fill in remaining variables:"
echo "   - DATABASE_URL"
echo "   - REDIS_URL"
echo "   - NEXTAUTH_URL, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL"
echo "   - OAuth credentials (optional)"
echo "   - Payment processor credentials (optional)"
echo ""
echo "2. Run the application:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "3. Check logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f platform"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🔒 Security Note:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  NEVER commit .env.production to version control!"
echo "⚠️  Keep your secrets secure and backed up safely."
echo "⚠️  Rotate secrets regularly for better security."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
