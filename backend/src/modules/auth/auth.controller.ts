import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import bcrypt from 'bcryptjs';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;
      
      // Hash password before passing to service
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await AuthService.register(email, passwordHash, name, role);
      res.status(202).json(result); 
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async approve(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token) throw new Error('Token is required.');
      
      const user = await AuthService.approve(token as string);
      res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #10b981;">✅ Access Granted</h1>
          <p>The account for <strong>${user.name}</strong> has been activated.</p>
          <p>An email has been sent to the user.</p>
        </div>
      `);
    } catch (error: any) {
      res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">❌ Error</h1>
          <p>${error.message}</p>
        </div>
      `);
    }
  }

  static async deny(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token) throw new Error('Token is required.');
      
      const result = await AuthService.deny(token as string);
      res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #64748b;">❌ Access Denied</h1>
          <p>${result.message}</p>
        </div>
      `);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await AuthService.findUserById(userId);
      if (!user) throw new Error('User not found.');
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
