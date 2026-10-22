import { defineConfig, devices } from '@playwright/test';

// Set PLAYWRIGHT_PORT to run several checkouts at once; --strictPort makes a taken port fail
// loudly instead of testing another checkout's server.
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
	testDir: 'e2e',
	forbidOnly: !!process.env.CI,
	use: { baseURL },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: `bun run build && bun run preview --host 127.0.0.1 --port ${port} --strictPort`,
		url: baseURL
	}
});
