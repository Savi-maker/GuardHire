import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';

const SECRET = 'super_tajne_haslo';

// JWT middleware
export const authenticateJWT: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      (req as any).user = user; 
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Sprawdź jedną rolę
export const requireRole = (role: string): RequestHandler => {
  return (req, res, next) => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
      res.status(403).json({ error: 'Brak uprawnień' });
      return;
    }
    next();
  };
};

// Sprawdź wiele ról
export const requireRoles = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Brak uprawnień' });
      return;
    }
    next();
  };
};
