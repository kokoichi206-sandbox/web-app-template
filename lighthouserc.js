module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000"],
      startServerCommand: "pnpm start",
      startServerReadyPattern: "Ready on",
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "categories:pwa": "off", // PWA is optional
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
