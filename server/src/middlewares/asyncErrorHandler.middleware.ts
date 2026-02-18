import { NextFunction, Request, Response } from "express";

const asyncErrorHandlerMiddleware = (
  func: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((err) => {
      next(err);
    });
  };
};

export default asyncErrorHandlerMiddleware;
