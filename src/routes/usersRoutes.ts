import { Router, Request, Response } from "express";

const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("List of employees");
});

// Exemple de route POST
router.post("/", (req: Request, res: Response) => {
  const { name, position } = req.body;
  // Logique pour ajouter un employé
  res.send(`Employee ${name} added to position ${position}`);
});

export default router;
