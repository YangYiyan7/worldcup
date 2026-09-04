import { Controller, Get } from '@midwayjs/decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@midwayjs/swagger';

@ApiTags('Health')
@Controller('/api/health')
export class HealthController {
  private startTime: number = Date.now();

  @Get('/')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
