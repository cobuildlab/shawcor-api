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
const expressAsyncWrapper = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default expressAsyncWrapper;
