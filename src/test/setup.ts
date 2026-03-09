import "@testing-library/jest-dom";

import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, beforeAll, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global test setup
beforeAll(() => {
  // Mock Next.js router
  vi.mock("next/navigation", () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/",
  }));

  // Mock Next.js Image component
  vi.mock("next/image", () => ({
    default: (props: { src: string; alt: string; [key: string]: unknown }) => {
      const { src, alt, ...rest } = props;
      return React.createElement("img", { src, alt, ...rest });
    },
  }));

  // Mock Next.js Link component
  vi.mock("next/link", () => ({
    default: (props: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
      const { children, href, ...rest } = props;
      return React.createElement("a", { href, ...rest }, children);
    },
  }));

  // Mock process.env for tests - skip NODE_ENV as it's read-only
  // eslint-disable-next-line no-process-env
  process.env["NEXT_PUBLIC_APP_ENV"] = "local";
  // eslint-disable-next-line no-process-env
  process.env["NEXT_PUBLIC_APP_URL"] = "http://localhost:3000";
});
