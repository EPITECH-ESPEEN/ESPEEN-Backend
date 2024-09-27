import { Request, Response, NextFunction } from "express";

export default (controllerFunc: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(controllerFunc(req, res, next)).catch(next);
