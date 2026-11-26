import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
	testDir: '.',
	forbidOnly: !!process.env.CI,
	use: { baseURL },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		cwd: '..',
		command: `bun run build && bun run preview --host 127.0.0.1 --port ${port} --strictPort`,
		url: baseURL
	}
});
