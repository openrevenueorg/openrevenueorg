# OpenRevenue

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

**OpenRevenue** is an open-source alternative to TrustMRR that allows startups to verify and showcase their revenue transparently. The platform consists of two complementary components:

1. **OpenRevenue Platform**: The main web application for discovering and showcasing verified startups
2. **OpenRevenue Standalone App**: A self-hosted data provider that indies/startups can install on their own servers

## ✨ Features

- 🔗 **Dual Integration**: Choose between direct API access or self-hosted standalone apps
- 🔒 **Data Sovereignty**: Keep sensitive revenue data on your own infrastructure
- 🛡️ **Data Verification**: Cryptographic signatures ensure data authenticity
- 🎨 **Customizable UI**: White-label web interface for your revenue showcase
- 📊 **Multiple Providers**: Support for Stripe, Paddle, Lemon Squeezy, PayPal
- 🔍 **Transparent**: Open-source and community-driven
- 📱 **Responsive**: Works on all devices

## 🚀 Quick Start

### Platform Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/platform/.env.example apps/platform/.env.local
# Edit .env.local with your values

# Set up database
pnpm db:push

# Start development server
pnpm dev
```

### Standalone App (Self-Hosted)

```bash
# Using Docker (Recommended)
docker run -d \
  --name openrevenue-standalone \
  -p 3001:3001 \
  -v ./data:/app/data \
  -e JWT_SECRET=your-secret-here \
  openrevenue/standalone:latest

# Access your standalone app
# Web UI: http://localhost:3001
# API: http://localhost:3001/api/v1
```

## 📖 Documentation

- [Technical Specification](./openrevenue_tech_spec.md)
- [Development Guide](./CLAUDE.md)
- [Standalone App Deployment](./openrevenue_tech_spec.md#18-standalone-app-deployment-guide)
- [API Documentation](./openrevenue_tech_spec.md#5-api-specifications)

## 🏗️ Architecture

OpenRevenue uses a unique dual-architecture approach:

- **Main Platform**: Aggregates and displays revenue data from multiple sources
- **Standalone Apps**: Self-hosted instances that keep your data private while providing verified metrics

This approach gives you the choice between convenience (direct API integration) and privacy (self-hosted data).

## 🛠️ Tech Stack

### Main Platform
- **Frontend**: Next.js 14+ with App Router, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, BullMQ + Redis
- **Database**: PostgreSQL, Redis for caching
- **Authentication**: NextAuth.js v5

### Standalone App
- **Backend**: Express.js/Fastify
- **Frontend**: Next.js (static export) or vanilla HTML/CSS/JS
- **Database**: SQLite (default) or PostgreSQL
- **Deployment**: Docker container

## 🔒 Security & Privacy

- **End-to-End Encryption**: API keys encrypted at rest
- **Data Verification**: Cryptographic signatures for all data
- **Rate Limiting**: Protection against abuse
- **HTTPS Only**: All communications secured
- **Data Sovereignty**: Your data stays on your infrastructure (standalone mode)

## 🤝 Contributing

We welcome contributions! Please read our [contribution guidelines](./CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

### Phase 1 (MVP)
- [x] Project setup and architecture
- [ ] Core platform with Stripe integration
- [ ] Basic standalone app with web UI
- [ ] Data verification system
- [ ] Docker deployment

### Phase 2 (Growth)
- [ ] Multiple payment processors
- [ ] Stories and milestones
- [ ] Public API
- [ ] Enhanced analytics

### Phase 3 (Scale)
- [ ] Embeddable widgets
- [ ] Community features
- [ ] White-label customization
- [ ] Advanced verification

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by TrustMRR and the indie hacker community
- Built for transparency and data sovereignty
- Powered by the open-source community

---

**Star ⭐ this repo if you find it useful!**

For questions, reach out to us at [hello@openrevenue.org](mailto:hello@openrevenue.org) or open an issue.