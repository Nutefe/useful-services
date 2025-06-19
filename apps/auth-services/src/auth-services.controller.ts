import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthServicesService } from './auth-services.service';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GoogleOauthGuard } from './auth/guards/google-oauth.guard';
import { ResetPasswordDto } from './users/dto/reset-password.dto';
import { UserEntity } from './users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { SiginUpDto } from './dto/siginup.dto';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { JwtAutGuard } from './auth/guards/jwt-auth.guard';
import { UserDto } from '@app/common';

@Controller('api/auth/v1')
@ApiTags('Login endpoint')
export class AuthServicesController {
  constructor(private readonly authServicesService: AuthServicesService) {}

  @Post('login')
  @ApiCreatedResponse({
    description: 'The user has been successfully login.',
  })
  @ApiOperation({ summary: 'Login a user' })
  async login(@Body() existingUser: LoginDto) {
    return this.authServicesService.logIn(existingUser);
  }

  @Post('siginup')
  @ApiCreatedResponse({
    description: 'The user has been successfully siginup.',
  })
  @ApiOperation({ summary: 'Siginup a user' })
  async siginup(@Body() siginUpDto: SiginUpDto) {
    return this.authServicesService.signinUp(siginUpDto);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleAuth(
    @Query('service_name') service_name: string,
    @Req() req: Request & { session?: Record<string, any> },
  ) {
    if (service_name) {
      if (req.session) {
        req.session.service_name = service_name;
      }
    }
    // passport va rediriger automatiquement
  }

  @Get('login/success')
  @UseGuards(GoogleOauthGuard)
  async successAuth() {
    // passport va rediriger automatiquement
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @Req()
    req: Request & {
      user?: UserEntity;
      query?: { state?: string };
    },
    @Res() res: import('express').Response,
  ) {
    if (!req?.query?.state) {
      throw new UnauthorizedException(
        'You must be authenticated to access this resource.',
      );
    }

    const serviceName: string = req?.query?.state;
    // req.user est défini par la strategy (utilisateur authentifié)
    const jwt = await this.authServicesService.generateJwt(
      req?.user as UserEntity,
      serviceName,
    );

    if (serviceName && jwt.user.id) {
      await this.authServicesService.updateUseroleServices(
        BigInt(jwt.user.id),
        serviceName,
      );
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/login/success?token=${jwt.token}&user=${JSON.stringify(
        jwt.user,
      )}`,
    );
  }

  @Get('forget/password')
  @ApiResponse({
    status: 200,
    description: 'The email has been successfully send.',
  })
  @ApiQuery({ name: 'email' })
  async forgetPasswordMail(@Query('email') email: string): Promise<void> {
    return this.authServicesService.forgetPasswordEmail(email);
  }

  @Post('reset/forget/password')
  @ApiResponse({
    status: 200,
    description: 'The password has been successfully reset.',
  })
  async forgetPassword(@Body() resetPassword: ResetPasswordDto): Promise<void> {
    return this.authServicesService.forgetPassword(
      resetPassword.token,
      resetPassword,
    );
  }

  @Get('verify/email')
  @ApiResponse({
    status: 200,
    description: 'The password has been successfully reset.',
  })
  @ApiQuery({ name: 'token' })
  async valideMail(@Query('token') token: string) {
    return this.authServicesService.valideMail(token);
  }

  @MessagePattern('verify-jwt')
  @UseGuards(JwtAutGuard)
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ): Promise<{ exp: number; userdto: UserDto }> {
    const verified = await this.authServicesService.verifyJwt(payload.jwt);

    return verified;
  }
}
