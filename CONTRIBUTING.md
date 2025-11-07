# Contributing to OpenRevenue

Thank you for your interest in contributing to OpenRevenue! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+ (for platform development)
- Redis 7+ (for platform development)
- Docker (optional, for containerized development)

### Getting Started

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/openrevenue.git
cd openrevenue
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
# Platform
cp apps/platform/.env.example apps/platform/.env.local
# Edit .env.local with your values

# Standalone app
cp packages/standalone/.env.example packages/standalone/.env
# Edit .env with your values
```

4. **Start development database (using Docker)**

```bash
docker-compose up -d postgres redis
```

5. **Initialize platform database**

```bash
cd apps/platform
pnpm db:push
pnpm db:seed
```

6. **Start development servers**

```bash
# Start all apps
pnpm dev

# Or start specific apps
pnpm --filter @openrevenue/platform dev
pnpm --filter @openrevenue/standalone dev
```

## Project Structure

```
openrevenue/
├── apps/
│   └── platform/          # Main Next.js platform
├── packages/
│   ├── shared/            # Shared types and utilities
│   └── standalone/        # Standalone Express app
├── docker-compose.yml     # Development services
└── turbo.json            # Turborepo configuration
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Tests
pnpm test

# E2E tests (platform)
pnpm test:e2e
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new payment provider integration"
git commit -m "fix: resolve MRR calculation bug"
git commit -m "docs: update API documentation"
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing Guidelines

### Unit Tests

- Place tests next to the code they test
- Use descriptive test names
- Test edge cases and error conditions
- Aim for 80% coverage overall

### Integration Tests

- Test API endpoints thoroughly
- Test database operations
- Test external service integrations

### E2E Tests

- Test critical user flows
- Focus on happy paths and common error scenarios

## Adding New Payment Providers

To add a new payment provider:

1. Create a new provider class in `apps/platform/src/providers/`:

```typescript
export class NewProvider extends PaymentProvider {
  // Implement required methods
}
```

2. Update the provider factory in `apps/platform/src/providers/index.ts`

3. Add provider configuration to environment variables

4. Add tests for the new provider

5. Update documentation

## Documentation

- Update README.md for user-facing changes
- Update CLAUDE.md for development guidance
- Add JSDoc comments for new APIs
- Update technical specification for architecture changes

## Pull Request Process

1. **Ensure all tests pass** - CI must be green
2. **Update documentation** - Keep docs in sync
3. **Add changeset** - Describe your changes
4. **Request review** - Tag relevant maintainers
5. **Address feedback** - Respond to review comments
6. **Squash commits** - Clean up commit history if needed

## Getting Help

- **Discord**: [Join our community](https://discord.gg/openrevenue)
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make OpenRevenue better for everyone. We appreciate your time and effort!
