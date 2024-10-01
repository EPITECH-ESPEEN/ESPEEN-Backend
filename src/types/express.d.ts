import { UserRole } from "../models/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: number;
        role: UserRole;
      };
    }
  }
}
