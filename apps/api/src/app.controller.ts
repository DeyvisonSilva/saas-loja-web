import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  getRoot(@Res() res: any) {
    return res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }
}
