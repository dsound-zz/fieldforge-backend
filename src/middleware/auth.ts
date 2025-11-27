import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { unauthorized, forbidden } from "../utils/errors";
import { RequestUser } from "../types/express";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return next(unauthorized());

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(unauthorized("Invalid auth header"));

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as RequestUser;
    req.user = payload;
    return next();
  } catch (_err) {
    return next(unauthorized());
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return next(unauthorized());
    if (!roles.includes(user.role)) return next(forbidden());
    return next();
  };
};
