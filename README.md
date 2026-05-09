# RepoMind 🧠

> AI-powered GitHub repository analysis platform that helps developers understand architecture, onboarding flow, technologies, and project structure instantly.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-orange)](https://tanstack.com/start)

## 🎯 Problem Statement

Developers waste hours trying to understand unfamiliar codebases:
- **Onboarding friction** — New team members struggle to navigate large repositories
- **Context switching** — Jumping between projects requires re-learning architecture
- **Documentation gaps** — READMEs often lack architectural insights
- **Time waste** — Manual exploration of folder structures and dependencies
- **Knowledge silos** — Project knowledge trapped in senior developers' heads

## 💡 Solution

RepoMind analyzes any public GitHub repository and generates:
- **Instant architecture overview** — Understand the codebase structure in seconds
- **Intelligent summaries** — Purpose, target users, and tech stack inference
- **Beginner-friendly guides** — Step-by-step onboarding instructions
- **Repository health insights** — Code quality, maintainability, and complexity assessment
- **Interactive chat** — Ask questions about the repository structure
- **Developer-focused analysis** — Technical explanations tailored for engineers

## ✨ Features

### 🔍 Comprehensive Analysis
- **Tech Stack Detection** — Identifies 8 categories: languages, frontend, backend, build tools, package managers, deployment, testing, databases
- **Architecture Mapping** — Detects full-stack vs client-only vs backend patterns
- **Smart Heuristics** — Recognizes 100+ file/folder patterns
- **Entry Point Detection** — Finds main files and execution paths

### 📊 Repository Health Assessment
- **Documentation Quality** — Evaluates README depth, docs folder, examples
- **Project Structure** — Analyzes folder organization and conventions
- **Maintainability Score** — Checks TypeScript, testing, linting, CI/CD
- **Onboarding Difficulty** — Assesses setup complexity
- **Dependency Complexity** — Evaluates package management and multi-language projects
- **Code Organization** — Reviews modularity and architectural layers

### 🎓 Developer Insights
- **Project Scale** — Community size and adoption metrics
- **Maintainability** — Code quality indicators
- **Modularity** — Separation of concerns analysis
- **Collaboration** — Contribution patterns
- **Activity** — Development velocity and maintenance status

### 💬 Interactive Chat
- Keyword-based Q&A for common questions
- Architecture, frontend, backend, testing, deployment queries
- Structured responses with code examples
- Context-aware recommendations

## 🛠️ Tech Stack

### Frontend
- **React 19** — Modern UI library with concurrent features
- **TanStack Router** — Type-safe file-based routing
- **TanStack Query** — Data fetching and caching
- **Tailwind CSS 4** — Utility-first styling with custom animations
- **Radix UI** — Accessible component primitives
- **TypeScript 5.8** — End-to-end type safety

### Backend
- **TanStack Start** — Full-stack React framework with SSR
- **Cloudflare Workers** — Edge deployment for global performance
- **GitHub REST API** — Repository data fetching
- **Server-side analysis** — Heavy computation on the server

### Build & Development
- **Vite 7** — Lightning-fast build tool
- **Bun** — Fast package manager and runtime
- **ESLint + Prettier** — Code quality and formatting
- **TypeScript** — Strict type checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-repo-navigator.git
cd ai-repo-navigator

# Install dependencies
bun install
# or
npm install

# Start development server
bun run dev
# or
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Environment Variables (Optional)

Create a `.env` file for higher GitHub API rate limits:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

Without a token: 60 requests/hour  
With a token: 5,000 requests/hour

## 📁 Project Architecture

```
ai-repo-navigator/
├── src/
│   ├── routes/              # File-based routing
│   │   ├── __root.tsx      # Root layout with error boundaries
│   │   ├── index.tsx       # Landing page
│   │   ├── dashboard.tsx   # Analysis results page
│   │   └── api/            # Server-side API handlers
│   │       ├── analyze.ts  # Repository analysis endpoint
│   │       └── chat.ts     # Chat Q&A endpoint
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Radix UI wrappers (40+ components)
│   │   ├── AnalysisCard.tsx
│   │   ├── ChatPanel.tsx
│   │   └── Navbar.tsx
│   ├── lib/               # Core business logic
│   │   ├── analyze.server.ts  # Repository analysis engine (1400+ lines)
│   │   ├── github.server.ts   # GitHub API client
│   │   └── repo.ts           # URL parsing utilities
│   ├── router.tsx         # Router configuration
│   ├── server.ts          # Custom server entry (error wrapper)
│   └── styles.css         # Global styles + Tailwind
├── vite.config.ts         # Vite + TanStack Start config
├── wrangler.jsonc         # Cloudflare Workers deployment
└── package.json           # Dependencies and scripts
```

### Key Design Patterns

1. **Server-Side Analysis** — Heavy computation on server, lightweight client
2. **Heuristic Intelligence** — Pattern matching for tech detection (no LLM required)
3. **Progressive Enhancement** — Works without JavaScript, enhanced with React
4. **Type Safety** — End-to-end TypeScript with strict mode
5. **Component Composition** — Radix UI primitives + custom wrappers
6. **Error Resilience** — Multiple layers of error handling

## 🎨 Features in Detail

### Repository Analysis Engine

The core analysis engine (`src/lib/analyze.server.ts`) provides:

- **Tech Stack Detection** — Identifies frameworks, languages, and tools from file patterns
- **Architecture Inference** — Determines full-stack, frontend-only, or backend-only patterns
- **Important Files** — Prioritizes entry points and configuration files
- **Beginner Guide** — Generates step-by-step onboarding instructions
- **Health Assessment** — Evaluates 6 dimensions of repository quality

### Chat System

Keyword-based Q&A that responds to:
- Authentication questions → Shows auth patterns and security checklist
- Frontend questions → Explains UI architecture and state management
- Backend questions → Details API design and request lifecycle
- Testing questions → Describes test strategy and coverage
- Deployment questions → Outlines CI/CD and deployment process

## 🗺️ Future Roadmap

### Phase 1: Enhanced Analysis (Q2 2026)
- [ ] Real AI integration (OpenAI/Anthropic) for deeper insights
- [ ] File content analysis (not just structure)
- [ ] Dependency graph visualization
- [ ] Code complexity metrics

### Phase 2: Collaboration Features (Q3 2026)
- [ ] GitHub OAuth for private repositories
- [ ] Team workspaces and shared analyses
- [ ] Annotation and note-taking on repositories
- [ ] Export analysis as PDF/Markdown

### Phase 3: Advanced Features (Q4 2026)
- [ ] Repository comparison mode
- [ ] Historical analysis (track changes over time)
- [ ] Custom analysis templates
- [ ] API for programmatic access

### Phase 4: Enterprise (2027)
- [ ] Self-hosted deployment option
- [ ] GitLab and Bitbucket support
- [ ] Advanced security scanning
- [ ] Team analytics and insights

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   bun run dev
   ```
5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style (ESLint + Prettier)
- Write TypeScript with strict mode
- Add comments for complex logic
- Test your changes locally
- Update documentation if needed

### Areas for Contribution

- 🐛 **Bug fixes** — Check open issues
- ✨ **New features** — Propose in discussions first
- 📝 **Documentation** — Improve README, add guides
- 🎨 **UI/UX** — Enhance design and accessibility
- 🧪 **Testing** — Add unit/integration tests
- 🌐 **Internationalization** — Add language support

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2026 RepoMind Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **TanStack** — For the amazing Start framework and Router
- **Radix UI** — For accessible component primitives
- **Cloudflare** — For edge computing platform
- **GitHub** — For the comprehensive REST API
- **Tailwind CSS** — For utility-first styling

## 📞 Support

- **Issues** — [GitHub Issues](https://github.com/yourusername/ai-repo-navigator/issues)
- **Discussions** — [GitHub Discussions](https://github.com/yourusername/ai-repo-navigator/discussions)
- **Email** — support@repomind.dev

---

<p align="center">Made with ❤️ by developers, for developers</p>
<p align="center">⭐ Star us on GitHub if RepoMind helps you!</p>
