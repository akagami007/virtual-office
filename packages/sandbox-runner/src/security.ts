import path from 'path';
import { SandboxSecurityPolicy } from './types.js';

export const DEFAULT_SECURITY_POLICY: SandboxSecurityPolicy = {
  allowedBinaries: [
    'npm',
    'npx',
    'pnpm',
    'node',
    'tsc',
    'eslint',
    'jest',
    'vitest',
    'playwright',
    'flutter',
    'expo',
    'git',
    'echo',
    'cat',
    'ls',
    'mkdir',
  ],
  disallowedPatterns: [
    /rm\s+-rf\s+\/($|\s)/,
    /:()\s*\{\s*:\|:&\s*\};:/, // fork bomb
    />\s*\/dev\/(sd[a-z]|null)/,
    /chmod\s+-R\s+777\s+\//,
    /curl\s+.*\|\s*sh/,
    /wget\s+.*\|\s*sh/,
    /\bshutdown\b/,
    /\breboot\b/,
  ],
  maxExecutionTimeMs: 120_000, // 2 minutes
  maxMemoryMb: 2048,
  maxCpuCores: 2,
};

export class SandboxSecurityValidator {
  constructor(private policy: SandboxSecurityPolicy = DEFAULT_SECURITY_POLICY) {}

  public validateCommand(command: string, args: string[] = []): { valid: boolean; reason?: string } {
    const fullCommandLine = `${command} ${args.join(' ')}`.trim();

    // 1. Check disallowed harmful patterns
    for (const pattern of this.policy.disallowedPatterns) {
      if (pattern.test(fullCommandLine)) {
        return {
          valid: false,
          reason: `Security Violation: Perintah diblokir karena cocok dengan pola terlarang (${pattern})`,
        };
      }
    }

    // 2. Extract base command (e.g. "npm" from "npm run build" or "node" from "/usr/bin/node")
    const baseBinary = path.basename(command);
    if (!this.policy.allowedBinaries.includes(baseBinary)) {
      return {
        valid: false,
        reason: `Security Violation: Binary "${baseBinary}" tidak termasuk dalam daftar whitelist yang diizinkan (${this.policy.allowedBinaries.join(', ')})`,
      };
    }

    return { valid: true };
  }

  public validatePath(workspaceRoot: string, targetPath: string): { valid: boolean; resolvedPath?: string; reason?: string } {
    const resolved = path.resolve(workspaceRoot, targetPath);
    if (!resolved.startsWith(path.resolve(workspaceRoot))) {
      return {
        valid: false,
        reason: `Path Traversal Violation: Akses di luar direktori workspace tidak diizinkan (${targetPath})`,
      };
    }
    return { valid: true, resolvedPath: resolved };
  }
}
