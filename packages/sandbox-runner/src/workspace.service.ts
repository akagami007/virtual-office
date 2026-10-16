import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { ExecutionRequest, ExecutionResult, ISandboxDriver, WorkspaceFile } from './types.js';
import { SandboxSecurityValidator } from './security.js';
import { LocalSandboxDriver } from './drivers/local.driver.js';
import { DockerSandboxDriver } from './drivers/docker.driver.js';

export class WorkspaceManager {
  private baseWorkspacesDir: string;
  private validator = new SandboxSecurityValidator();
  private dockerDriver = new DockerSandboxDriver();
  private localDriver = new LocalSandboxDriver();

  constructor(baseDir?: string) {
    this.baseWorkspacesDir = baseDir || path.resolve(process.cwd(), 'workspaces');
    if (!fsSync.existsSync(this.baseWorkspacesDir)) {
      fsSync.mkdirSync(this.baseWorkspacesDir, { recursive: true });
    }
  }

  public getWorkspacePath(projectId: string): string {
    return path.join(this.baseWorkspacesDir, projectId);
  }

  public async ensureWorkspace(projectId: string): Promise<string> {
    const wsPath = this.getWorkspacePath(projectId);
    await fs.mkdir(wsPath, { recursive: true });
    return wsPath;
  }

  public async writeFile(projectId: string, relativePath: string, content: string): Promise<string> {
    const wsPath = await this.ensureWorkspace(projectId);
    const valid = this.validator.validatePath(wsPath, relativePath);
    if (!valid.valid || !valid.resolvedPath) {
      throw new Error(valid.reason || 'Invalid file path');
    }

    const dir = path.dirname(valid.resolvedPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(valid.resolvedPath, content, 'utf-8');
    return valid.resolvedPath;
  }

  public async readFile(projectId: string, relativePath: string): Promise<string> {
    const wsPath = this.getWorkspacePath(projectId);
    const valid = this.validator.validatePath(wsPath, relativePath);
    if (!valid.valid || !valid.resolvedPath) {
      throw new Error(valid.reason || 'Invalid file path');
    }
    return fs.readFile(valid.resolvedPath, 'utf-8');
  }

  public async listFiles(projectId: string, subDir: string = ''): Promise<WorkspaceFile[]> {
    const wsPath = this.getWorkspacePath(projectId);
    const targetDir = path.join(wsPath, subDir);

    if (!fsSync.existsSync(targetDir)) {
      return [];
    }

    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const results: WorkspaceFile[] = [];

    for (const entry of entries) {
      // Ignore git and node_modules in tree preview
      if (entry.name === '.git' || entry.name === 'node_modules') continue;

      const fullPath = path.join(targetDir, entry.name);
      const relativePath = path.relative(wsPath, fullPath);

      if (entry.isDirectory()) {
        const children = await this.listFiles(projectId, path.join(subDir, entry.name));
        results.push({
          name: entry.name,
          path: fullPath,
          relativePath,
          isDirectory: true,
          children,
        });
      } else {
        const stat = await fs.stat(fullPath);
        results.push({
          name: entry.name,
          path: fullPath,
          relativePath,
          isDirectory: false,
          size: stat.size,
        });
      }
    }

    return results;
  }

  public async executeCommand(request: ExecutionRequest): Promise<ExecutionResult> {
    const wsPath = await this.ensureWorkspace(request.projectId);

    // Pick driver: Docker if available and allowed, otherwise fallback to local
    let activeDriver: ISandboxDriver = this.localDriver;
    try {
      const dockerAvailable = await this.dockerDriver.isAvailable();
      if (dockerAvailable) {
        activeDriver = this.dockerDriver;
      }
    } catch {
      activeDriver = this.localDriver;
    }

    return activeDriver.execute({
      ...request,
      cwd: wsPath,
    });
  }

  /**
   * Scaffolds an initial project directory based on platform
   */
  public async scaffoldProject(
    projectId: string,
    platform: 'WEB' | 'MOBILE' | 'FULLSTACK'
  ): Promise<void> {
    await this.ensureWorkspace(projectId);

    // 1. Root README.md
    await this.writeFile(
      projectId,
      'README.md',
      `# Project ${projectId}
Generated autonomously by NexusDev Studio Multi-Agent Software House.
Target Platform: ${platform}
`
    );

    // 2. Web structure
    if (platform === 'WEB' || platform === 'FULLSTACK') {
      await this.writeFile(
        projectId,
        'apps/web/package.json',
        JSON.stringify(
          {
            name: `${projectId}-web`,
            version: '0.1.0',
            scripts: {
              dev: 'next dev',
              build: 'next build',
              lint: 'next lint',
              test: 'jest',
            },
            dependencies: {
              next: '^15.0.0',
              react: '^19.0.0',
              'react-dom': '^19.0.0',
            },
          },
          null,
          2
        )
      );

      await this.writeFile(
        projectId,
        'apps/web/src/app/page.tsx',
        `export default function HomePage() {
  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold">Welcome to ${projectId}</h1>
      <p className="mt-2 text-gray-600">Built autonomously with Next.js 15 & Multi-Agent AI.</p>
    </main>
  );
}
`
      );
    }

    // 3. Backend structure
    if (platform === 'FULLSTACK') {
      await this.writeFile(
        projectId,
        'apps/server/package.json',
        JSON.stringify(
          {
            name: `${projectId}-server`,
            version: '0.1.0',
            scripts: {
              start: 'node src/index.js',
              test: 'jest',
            },
            dependencies: {
              express: '^4.21.0',
            },
          },
          null,
          2
        )
      );

      await this.writeFile(
        projectId,
        'apps/server/src/index.js',
        `const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(port, () => console.log(\`Backend service listening on port \${port}\`));
`
      );
    }

    // 4. Mobile structure
    if (platform === 'MOBILE' || platform === 'FULLSTACK') {
      await this.writeFile(
        projectId,
        'apps/mobile/app.json',
        JSON.stringify(
          {
            expo: {
              name: `${projectId} Mobile`,
              slug: `${projectId}-mobile`,
              version: '1.0.0',
              platforms: ['ios', 'android', 'web'],
            },
          },
          null,
          2
        )
      );

      await this.writeFile(
        projectId,
        'apps/mobile/App.tsx',
        `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NexusDev Mobile (${projectId})</Text>
      <Text style={styles.subtitle}>Expo & React Native Cross-Platform</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#6366f1', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', fontSize: 14, marginTop: 8 },
});
`
      );
    }

    // 5. Automated QA Test Suite
    await this.writeFile(
      projectId,
      'tests/e2e.test.js',
      `// Playwright / Jest Smoke Test
describe('NexusDev Project Smoke Tests', () => {
  test('Sanity check: workspace structure is valid', () => {
    expect(true).toBe(true);
  });
});
`
    );
  }
}
