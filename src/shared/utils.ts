/* eslint-disable no-unused-vars */
import fetch, { Response as NodeFetchResponse } from 'node-fetch';
import { Request, Response, NextFunction } from 'express';

import { log, flush } from './logger';

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response>;

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

export const fetchFileByUrl = async (
  url: string,
): Promise<NodeFetchResponse> => {
  const [result, error] = await handleTryCatch(fetch(url));

  if (error) {
    log(
      `ERROR FETCHING FILE: ${
        typeof error === 'string' ? error : JSON.stringify(error)
      }`,
    );
    await flush();
    throw new Error(
      `Error fetching file: ${
        typeof error === 'string' ? error : JSON.stringify(error)
      }`,
    );
  }

  return result;
};
