/**
 * Result 型: 成功または失敗を表す discriminated union。
 *
 * - 成功時: { ok: true, value: T }
 * - 失敗時: { ok: false, error: E }
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/**
 * 成功の Result を生成する。
 */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value }) as Result<T, never>;

/**
 * void を返す成功 Result を生成する。
 */
export const okVoid = (): Result<void, never> =>
  ({ ok: true, value: undefined }) as Result<void, never>;

/**
 * 失敗の Result を生成する。
 */
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error }) as Result<never, E>;

/**
 * Promise を Result に変換する (非同期版)。
 *
 * @example
 * const result = await safeTry(fetch('/api/data'));
 * const result = await safeTry(() => db.query.users.findFirst());
 */
export const safeTry = async <T, E = Error>(
  promise: Promise<T> | (() => Promise<T>)
): Promise<Result<T, E>> => {
  try {
    const data = typeof promise === "function" ? await promise() : await promise;
    return ok(data) as Result<T, E>;
  } catch (e) {
    return err(e as E) as Result<T, E>;
  }
};

/**
 * 同期関数を Result に変換する。
 *
 * @example
 * const result = safeTrySync(() => JSON.parse(jsonString));
 */
export const safeTrySync = <T, E = Error>(func: () => T): Result<T, E> => {
  try {
    const data = func();
    return ok(data) as Result<T, E>;
  } catch (e) {
    return err(e as E) as Result<T, E>;
  }
};

/**
 * Result が成功かどうかを判定する型ガード。
 */
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => result.ok;

/**
 * Result が失敗かどうかを判定する型ガード。
 */
export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } => !result.ok;

/**
 * Result の値を取り出す (失敗時はデフォルト値を返す)。
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  result.ok ? (result as { ok: true; value: T }).value : defaultValue;

/**
 * Result の値を変換する (成功時のみ)。
 */
export const mapResult = <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
  if (!result.ok) return result as Result<U, E>;
  return ok(fn((result as { ok: true; value: T }).value)) as Result<U, E>;
};
