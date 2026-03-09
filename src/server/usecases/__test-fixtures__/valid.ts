import "server-only";

import type { Result } from "@/shared/result";
import { ok } from "@/shared/result";

type AppError = {
  type: string;
  message: string;
};

/**
 * Valid: Arrow function returning Result
 */
export const getData = (): Result<string, AppError> => {
  return ok("data");
};

/**
 * Valid: Async arrow function returning Promise<Result>
 */
export const fetchData = async (): Promise<Result<string, AppError>> => {
  return ok("fetched data");
};

/**
 * Valid: Arrow function returning Result
 */
export const processData = (): Result<number, AppError> => {
  return ok(42);
};

/**
 * Valid: Async arrow function returning Promise<Result>
 */
export const asyncProcessData = async (): Promise<Result<number, AppError>> => {
  return ok(100);
};

/**
 * Valid: Object with methods returning Result
 */
export const dataUsecase = {
  getItem(): Result<string, AppError> {
    return ok("item");
  },

  async fetchItem(): Promise<Result<string, AppError>> {
    return ok("fetched item");
  },

  transformItem: (): Result<number, AppError> => {
    return ok(123);
  },

  asyncTransformItem: async (): Promise<Result<number, AppError>> => {
    return ok(456);
  },
};
