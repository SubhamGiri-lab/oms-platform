# Contributing to OMS

Thank you for your interest in contributing to the Order Management System! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** - Click the fork button on GitHub
2. **Clone your fork** - `git clone https://github.com/YOUR_USERNAME/oms-project.git`
3. **Add upstream remote** - `git remote add upstream https://github.com/ORIGINAL/oms-project.git`
4. **Create a feature branch** - `git checkout -b feature/your-feature-name`

## Development Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Code Standards

### Naming Conventions
- **Variables**: camelCase (e.g., `orderNumber`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ORDERS`)
- **Classes**: PascalCase (e.g., `OrderController`)
- **Files**: kebab-case for components (e.g., `order-card.js`)

### Code Quality

1. **Formatting**
   ```bash
   npm run format
   ```

2. **Linting**
   ```bash
   npm run lint
   ```

3. **Testing**
   ```bash
   npm test
   ```

### Commit Messages

Use conventional commits format:

```
type(scope): subject

type: feat, fix, docs, style, refactor, perf, test, chore, ci
scope: orders, customers, inventory, analytics, auth
subject: short, imperative, lowercase

Examples:
feat(orders): add order cancellation endpoint
fix(customers): resolve email validation issue
docs: update API documentation
```

## Pull Request Process

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Use descriptive title
   - Reference related issues (#123)
   - Describe changes clearly
   - Include screenshots if UI changes

4. **PR Checklist**
   - [ ] Code follows style guidelines
   - [ ] All tests pass
   - [ ] Documentation is updated
   - [ ] No breaking changes (or documented)
   - [ ] Commits are well-organized

## Areas for Contribution

### High Priority
- [ ] Unit and integration tests
- [ ] Error handling improvements
- [ ] Documentation
- [ ] Performance optimizations
- [ ] Security audits

### Good First Issues
- [ ] Documentation improvements
- [ ] UI/UX enhancements
- [ ] Bug fixes
- [ ] Code cleanup
- [ ] Testing coverage

## Reporting Issues

### Bug Reports
Include:
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs
- Environment details

### Feature Requests
Include:
- Clear description of the feature
- Use cases and benefits
- Proposed implementation (optional)
- Related issues

## Code Review Guidelines

Reviewers will check:
1. Code quality and consistency
2. Test coverage
3. Documentation completeness
4. Performance impact
5. Security implications

### Constructive Feedback
- Be respectful and constructive
- Suggest improvements with examples
- Ask questions rather than make demands
- Acknowledge good work

## Testing Requirements

### Backend
```bash
npm test
npm run test:coverage
```

### Frontend
```bash
npm test
npm run test:coverage
```

### Minimum Coverage
- Statements: 70%
- Branches: 70%
- Lines: 70%
- Functions: 70%

## Documentation

1. **Code Comments** - Explain WHY, not WHAT
2. **API Docs** - Update `/docs/API.md` for new endpoints
3. **README** - Update if setup/installation changes
4. **Database** - Update `/docs/DATABASE.md` for schema changes

## Release Process

1. **Version Bumping** - Use semantic versioning (MAJOR.MINOR.PATCH)
2. **Changelog** - Update CHANGELOG.md
3. **Tags** - Create git tag for release
4. **Deployment** - Follow deployment guide

## Community

- **Discussions** - GitHub Discussions for ideas
- **Issues** - Bug reports and feature requests
- **Pull Requests** - Code contributions
- **Email** - team@example.com for security issues

## Code of Conduct

We are committed to providing a welcoming and inspiring community. Please read our Code of Conduct before contributing.

### Be respectful and inclusive
- Respect differing opinions
- Welcome newcomers
- Focus on constructive discussion
- No harassment, discrimination, or abuse

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Getting Help

- **Documentation** - See `/docs` folder
- **Issues** - Search existing issues
- **Discussions** - Start a discussion
- **Email** - team@example.com

---

Thank you for contributing! 🎉
