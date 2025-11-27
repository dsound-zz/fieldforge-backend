export type RequestUser = {
  id: number;
  role: string;
};

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



