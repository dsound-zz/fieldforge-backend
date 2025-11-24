import { RequestUser } from "../middleware/auth";

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
      validated?: {
        body?: any;
        query?: any;
        params?: any;
      };
    }
  }
}

export {};



