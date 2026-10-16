import { spawn } from 'child_process';
import { ExecutionRequest, ExecutionResult, ISandboxDriver } from '../types.js';
import { SandboxSecurityValidator } from '../security.js';

export class LocalSandboxDriver implements ISandboxDriver {
  name: 'local' = 'local';
  private validator = new SandboxSecurityValidator();

  async isAvailable(): Promise<boolean> {
    return true; // Local runner is always available
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    const { command, args = [], cwd, env, timeoutMs = 120_000 } = request;

    // Validate command security
    const validation = this.validator.validateCommand(command, args);
    if (!validation.valid) {
      return {
        exitCode: 126,
        stdout: '',
        stderr: validation.reason || 'Command rejected by sandbox security policy',
        durationMs: Date.now() - startTime,
        timedOut: false,
        driver: 'local',
      };
    }

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const childEnv = {
        ...process.env,
        ...env,
      };

      const resolvedCommand = command === 'node' ? process.execPath : command;

      let child;
      try {
        child = spawn(resolvedCommand, args, {
          cwd: cwd || process.cwd(),
          env: childEnv,
          shell: false,
        });
      } catch (err: any) {
        return resolve({
          exitCode: 1,
          stdout: '',
          stderr: `Spawn Error: ${err.message}`,
          durationMs: Date.now() - startTime,
          timedOut: false,
          driver: 'local',
        });
      }

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
          stderr: `${stderr}\nExecution Error: ${err.message}`,
          durationMs: Date.now() - startTime,
          timedOut,
          driver: 'local',
        });
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          exitCode: timedOut ? 124 : (code ?? 0),
          stdout,
          stderr: timedOut ? `${stderr}\nProcess timed out after ${timeoutMs}ms (SIGKILL)` : stderr,
          durationMs: Date.now() - startTime,
          timedOut,
          driver: 'local',
        });
      });
    });
  }
}
