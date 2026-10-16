export interface SandboxSecurityPolicy {
  allowedBinaries: string[];
  disallowedPatterns: RegExp[];
  maxExecutionTimeMs: number;
  maxMemoryMb: number;
  maxCpuCores: number;
}

export interface ExecutionRequest {
  projectId: string;
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
}

export interface ExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
  driver: 'docker' | 'local';
}

export interface WorkspaceFile {
  name: string;
  path: string;
  relativePath: string;
  isDirectory: boolean;
  size?: number;
  children?: WorkspaceFile[];
}

export interface ISandboxDriver {
  name: 'docker' | 'local';
  isAvailable(): Promise<boolean>;
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
}
