import { execSync } from 'child_process';
import fs from 'fs';

try {
  const output = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
  fs.writeFileSync('ts-output.txt', 'SUCCESS:\n' + output);
} catch (error) {
  fs.writeFileSync('ts-output.txt', 'ERROR:\n' + error.stdout + '\n' + error.stderr);
}
