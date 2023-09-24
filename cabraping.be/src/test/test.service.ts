import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  constructor() {}
  health() {
    return { msg: 'Health is Ok' };
  }
}
