/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response>;
type ResponseFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

/**
 * Wraps an asyncronous function in order to catch any errors and pass them to the Express middleware.
 *
 * @param fn - Async function to be wrapped.
 * @returns Wrapped function.
 */
export const expressAsyncWrapper = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Helper for try-catch-finally blocks.
 *
 * @param promise - Promise function to resolve.
 * @returns Promise - Promise function to resolve.
 */
export async function handleTryCatch<T>(
  promise: (() => Promise<T>) | Promise<T>,
): Promise<[T, undefined] | [undefined, Error]> {
  const currentPromise = typeof promise === 'function' ? promise() : promise;

  try {
    const result = await currentPromise;
    return [result, undefined];
  } catch (error: unknown) {
    return [undefined, error as Error];
  }
}
