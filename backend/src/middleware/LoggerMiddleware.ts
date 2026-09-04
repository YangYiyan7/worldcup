import { IMiddleware, Middleware } from '@midwayjs/decorator';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class LoggerMiddleware implements IMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      const { method, url, ip } = ctx.request;

      console.log(`[${new Date().toISOString()}] ${method} ${url} - Request from ${ip}`);

      await next();

      const endTime = Date.now();
      const duration = endTime - startTime;
      const { status } = ctx.response;

      console.log(
        `[${new Date().toISOString()}] ${method} ${url} - ${status} - ${duration}ms`
      );
    };
  }
}
