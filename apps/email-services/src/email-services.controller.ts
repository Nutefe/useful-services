import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { EmailServicesService } from './email-services.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { log } from 'console';
import { ConvocationMailDto, UserEmailDto } from '@app/common';

@Controller('api/v1/email')
export class EmailServicesController {
  constructor(private readonly emailServicesService: EmailServicesService) {}

  @Get('select')
  sendEmailExempl() {
    return this.emailServicesService.sendExemple();
  }

  @MessagePattern('send-email')
  @UsePipes(new ValidationPipe())
  async sendEmail(@Payload() data: any) {
    log('Received data:', data);
    return this.emailServicesService.sendExemple();
  }

  @MessagePattern('forget-password-email')
  @UsePipes(new ValidationPipe())
  async sendEmailForgetPassword(@Payload() data: UserEmailDto) {
    return this.emailServicesService.sendForgetPasswordEmail(data);
  }

  @MessagePattern('success-reset-email')
  @UsePipes(new ValidationPipe())
  async sendEmailSuccessReset(@Payload() data: UserEmailDto) {
    return this.emailServicesService.sendSuccessPasswordResetEmail(data);
  }

  @MessagePattern('success-validation-email')
  @UsePipes(new ValidationPipe())
  async sendEmailSuccessValidation(@Payload() data: UserEmailDto) {
    return this.emailServicesService.sendSuccessValidationEmail(data);
  }

  @MessagePattern('confirm-email')
  @UsePipes(new ValidationPipe())
  async sendEmailConfimation(@Payload() data: UserEmailDto) {
    return this.emailServicesService.sendConfirmAccountEmail(data);
  }

  //
  @MessagePattern('convocation-send')
  @UsePipes(new ValidationPipe())
  async sendEmailConvocation(@Payload() data: ConvocationMailDto) {
    return this.emailServicesService.sendConfirmAccountEmail(data);
  }
}
