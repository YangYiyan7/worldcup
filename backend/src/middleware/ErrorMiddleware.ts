import { IMiddleware, Middleware } from '@midwayjs/decorator';
import { Context, NextFunction } from '@midwayjs/koa';
import { UserNotFoundError } from '../service/UserService';

@Middleware()
export class ErrorMiddleware implements IMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      try {
        await next();
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error);

        if (error instanceof UserNotFoundError) {
          ctx.status = 404;
          ctx.body = {
            success: false,
            message: error.message,
            timestamp: new Date().toISOString(),
          };
        } else if (error instanceof Error) {
          ctx.status = 500;
          ctx.body = {
            success: false,
            message: 'Internal server error',
            timestamp: new Date().toISOString(),
          };
        } else {
          ctx.status = 500;
          ctx.body = {
            success: false,
            message: 'Unknown error occurred',
            timestamp: new Date().toISOString(),
          };
        }
      }
    };
  }
}
