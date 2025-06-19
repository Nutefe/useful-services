import { Controller } from '@nestjs/common';
import { NotificationServicesService } from './notification-services.service';

@Controller()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationServicesService,
  ) {}
}
