import { NextFunction, Request, Response } from "express";

export function errorHandlerMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const message =
    error instanceof Error ? error.message : "Ocurrio un error inesperado.";

  res.status(500).json({
    message,
  });
}
