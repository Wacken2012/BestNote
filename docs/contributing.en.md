# 🤝 Contributing to BestNote

Welcome to BestNote — an AI-assisted score and calendar management system for music clubs. We welcome contributions from musicians, developers and open-source enthusiasts.

## 🧭 Project Overview

- Modular structure (Directives, Services, Stores)
- Role-based permissions
- Multilingual documentation
- Fully testable with Vitest

## 🛠 Contribution Rules

- Please follow the branch conventions
- Use clear commits (`type(scope): message`)
- Document new features in `README` or `docs/`
- Test new features with Vitest

## 🌿 Branch Conventions

- `main`: stable production branch
- `feature/xyz`: new features
- `fix/xyz`: bug fixes
- `docs/xyz`: documentation

## 🧪 Tests

- Test structure: `tests/`
- Global test init: `tests/setup.ts`
- Directives: `tests/directives/`
- Services: `tests/services/`
- Run tests:

```bash
npm run test
npm run test -- --coverage
```

## ✅ PR Checklist

- [ ] Tests pass locally
- [ ] New features are covered by tests
- [ ] Documentation updated
- [ ] Commit message is clear
- [ ] Branch naming follows conventions

## 🚀 Release notes

Please refer to `RELEASE.md` for the full release process.

## 📜 License

This project is licensed under GPLv3.

---

### 💾 Commit suggestion

```bash
git add docs/contributing.en.md
git commit -m "docs: add English contributing guide"
git push
```
