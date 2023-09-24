import { Controller, Get } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private testService: TestService) {}

  //GET /test
  @Get('health')
  health() {
    return this.testService.health();
  }
}
