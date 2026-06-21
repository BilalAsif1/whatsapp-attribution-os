import { Controller, All, Req, Res } from '@nestjs/common';
import { ApiTags, ApiExcludeController } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from '@common/decorators';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@ApiExcludeController()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.authService.handleRequest(req, res);
  }
}
