import "server-only";

/**
 * Invalid: Function declaration returning string instead of Result
 */
export function getData() {
  return "data";
}

/**
 * Invalid: Async function declaration returning string instead of Promise<Result>
 */
export async function fetchData() {
  return "fetched data";
}

/**
 * Invalid: Arrow function returning number instead of Result
 */
export const processData = () => {
  return 42;
};

/**
 * Invalid: Async arrow function returning number instead of Promise<Result>
 */
export const asyncProcessData = async () => {
  return 100;
};

/**
 * Invalid: Object with methods returning non-Result types
 */
export const dataUsecase = {
  getItem() {
    return "item";
  },

  async fetchItem() {
    return "fetched item";
  },

  transformItem: () => {
    return 123;
  },

  asyncTransformItem: async () => {
    return 456;
  },
};
