import { ParsedRequest } from 'express';
import { AuthFailureError } from '../core/ApiError';
import asyncHandler from '../middlewares/asyncHandler';
// import { roleRepository } from '../database/repositories/role.repository';

// Authorization by role
export class AuthorizationMiddleware {
  public authorization = asyncHandler(async (req: ParsedRequest, res, next) => {
    if (!req.user) throw new AuthFailureError('Permission denied');
    return next();
  });
}
export const authorizationMiddleware = new AuthorizationMiddleware();
