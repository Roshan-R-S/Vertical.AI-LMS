import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import bcrypt from 'bcryptjs';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role, firstName, lastName, username, phone, profession } = req.body;
      
      if (role !== 'CHANNEL_PARTNER') {
        if (!password || password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
      }
      
      // Hash password if provided
      let passwordHash = "";
      if (password) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password, salt);
      } else if (role === 'CHANNEL_PARTNER') {
        // Fallback for partner if they didn't provide one initially
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash('TEMP_PWD_HOLDER', salt);
      } else {
        throw new Error('Password is required.');
      }

      const result = await AuthService.register(email, passwordHash, name, role, { 
        firstName, lastName, username, phone, profession 
      });
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
          <h1 style="color: #10b981;">Access Granted</h1>
          <p>The account for <strong>${user.name}</strong> has been activated.</p>
          <p>An email has been sent to the user.</p>
        </div>
      `);
    } catch (error: any) {
      res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">Error</h1>
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
          <h1 style="color: #64748b;">Access Denied</h1>
          <p>${result.message}</p>
        </div>
      `);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      // Support 'identifier' (Email or Username) or 'email' (for backward compatibility)
      const { identifier, email, password } = req.body;
      const targetIdentifier = identifier || email;
      
      if (!targetIdentifier) throw new Error('Email or Username is required.');

      const result = await AuthService.login(targetIdentifier, password);
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

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) throw new Error('Email is required.');
      const result = await AuthService.requestPasswordReset(email);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) throw new Error('Token and new password are required.');
      
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long.');
      }
      const result = await AuthService.resetPassword(token, newPassword);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        throw new Error('Current and new passwords are required.');
      }
      
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long.');
      }

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
