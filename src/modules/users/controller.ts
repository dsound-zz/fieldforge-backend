import { Request, Response, NextFunction } from "express";
import { authenticateUser, createUser, getUserById, listUsers } from "./service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.validated!.body;
    const result = await createUser(email, password, role);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.validated!.body;
    const result = await authenticateUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await listUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validated!.params;
    const user = await getUserById(id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
