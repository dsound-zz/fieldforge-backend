export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (entity: string, id?: string | number) =>
  new AppError(`${entity} ${id ? `with id ${id} ` : ""}not found`, 404);

export const unauthorized = (message = "Unauthorized") => new AppError(message, 401);
export const forbidden = (message = "Forbidden") => new AppError(message, 403);
