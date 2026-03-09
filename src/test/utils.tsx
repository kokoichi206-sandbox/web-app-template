import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement } from "react";
import { expect } from "vitest";

// Custom render function with providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
  // Add providers here when needed (e.g., Context providers, Query client, etc.)
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

// Override render method
export { customRender as render };

// Mock data generators
export const createMockUser = (
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
  }> = {}
) => ({
  id: "1",
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});

// API response mocks
export const createMockApiResponse = <T,>(
  data: T,
  overrides: Partial<{
    status: number;
    statusText: string;
  }> = {}
) => ({
  data,
  status: 200,
  statusText: "OK",
  ...overrides,
});

// Environment helpers
export const mockEnvVar = (key: string, value: string) => {
  // eslint-disable-next-line no-process-env
  const originalValue = process.env[key];
  // eslint-disable-next-line no-process-env
  process.env[key] = value;

  return () => {
    if (originalValue === undefined) {
      // eslint-disable-next-line no-process-env
      delete process.env[key];
    } else {
      // eslint-disable-next-line no-process-env
      process.env[key] = originalValue;
    }
  };
};

// Wait for async operations
export const waitForLoadingToFinish = async () => new Promise((resolve) => setTimeout(resolve, 0));

// Custom matchers
export const expectToBeInTheDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
};

export const expectToHaveTextContent = (element: HTMLElement | null, text: string | RegExp) => {
  expect(element).toHaveTextContent(text);
};

export const expectToBeVisible = (element: HTMLElement | null) => {
  expect(element).toBeVisible();
};
