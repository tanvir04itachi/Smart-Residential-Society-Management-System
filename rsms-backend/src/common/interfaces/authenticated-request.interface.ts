import { Request } from 'express';
import { User } from '../../database/entities';

export interface AuthenticatedRequest extends Request {
  user: User;
}
