import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check', description: 'Returns OK if the server is running.' })
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('debug-sentry')
  @ApiOperation({
    summary: 'Trigger a test error',
    description:
      'Deliberately throws an error so you can confirm Sentry is capturing errors correctly. Check your Sentry dashboard after calling this.',
  })
  getError() {
    throw new Error('This is a test error for Sentry monitoring 🚨');
  }
}
