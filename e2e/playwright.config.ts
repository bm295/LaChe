import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      name: 'Backend',
      command: 'npm run build && npm start',
      cwd: root,
      url: 'http://localhost:3000/health',
      env: { PORT: '3000' },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      name: 'Frontend',
      command: 'npm run dev -- --host localhost --port 5173 --strictPort',
      cwd: path.join(root, 'web'),
      url: 'http://localhost:5173',
      env: { VITE_API_URL: 'http://localhost:3000' },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
