import { spawn } from 'child_process';
import { ExecutionRequest, ExecutionResult, ISandboxDriver } from '../types.js';
import { SandboxSecurityValidator } from '../security.js';

export class DockerSandboxDriver implements ISandboxDriver {
  name: 'docker' = 'docker';
  private validator = new SandboxSecurityValidator();

  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const p = spawn('docker', ['info'], { stdio: 'ignore' });
      p.on('close', (code) => resolve(code === 0));
      p.on('error', () => resolve(false));
    });
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    const { command, args = [], cwd, timeoutMs = 120_000 } = request;

    // Validate command security
    const validation = this.validator.validateCommand(command, args);
    if (!validation.valid) {
      return {
        exitCode: 126,
        stdout: '',
        stderr: validation.reason || 'Command rejected by sandbox security policy',
        durationMs: Date.now() - startTime,
        timedOut: false,
        driver: 'docker',
      };
    }

    const workspaceDir = cwd || process.cwd();

    // Docker run arguments:
    // --rm: remove container upon exit
    // -v <host_dir>:/workspace: mount workspace into container
    // -w /workspace: set working directory
    // -m 2048m: memory limit
    // --cpus 2: CPU limit
    const dockerArgs = [
      'run',
      '--rm',
      '-v',
      `${workspaceDir}:/workspace`,
      '-w',
      '/workspace',
      '-m',
      '2048m',
      '--cpus',
      '2',
      'node:20-alpine',
      command,
      ...args,
    ];

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const child = spawn('docker', dockerArgs);

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          exitCode: 1,
          stdout,
          stderr: `${stderr}\nDocker Execution Error: ${err.message}`,
          durationMs: Date.now() - startTime,
          timedOut,
          driver: 'docker',
        });
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          exitCode: timedOut ? 124 : (code ?? 0),
          stdout,
          stderr: timedOut ? `${stderr}\nContainer process timed out after ${timeoutMs}ms (SIGKILL)` : stderr,
          durationMs: Date.now() - startTime,
          timedOut,
          driver: 'docker',
        });
      });
    });
  }
}
