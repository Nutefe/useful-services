import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailDto } from './dto/emails.dto';
import { ConvocationMailDto, DatabaseService, UserEmailDto } from '@app/common';
import { EmailEntity } from './entities/email.entity';
import ical, {
  ICalAttendeeRole,
  ICalAttendeeType,
  ICalEventStatus,
} from 'ical-generator';
import moment from 'moment';
import { ConfigService } from '@nestjs/config';

const CLIENT_DOMAINE = process.env.CLIENT_DOMAINE || 'http://localhost:3000/';

@Injectable()
export class EmailServicesService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async create(emailDto: EmailDto) {
    const { user_id, subject, body } = emailDto;
    const newMail = await this.databaseService.emails.create({
      data: {
        user: { connect: { id: user_id } },
        subject,
        body,
      },
    });
    return new EmailEntity(newMail);
  }

  async findMailByUserid(id: number): Promise<EmailEntity[]> {
    const emails = await this.databaseService.emails.findMany({
      where: {
        user: {
          id,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return emails.map((email) => new EmailEntity(email));
  }

  async sendExemple() {
    const url = `example.com/auth/confirm?token=785454`;
    // console.log(url);

    await this.mailerService.sendMail({
      to: 'martingbeze52@gmail.com', //nutefe.gbeze@cyberethik.com // martingbeze52@gmail.com
      from: 'notifications@cyberethik.com', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirm-account', // either change to ./transactional or rename transactional.html to confirmation.html
      context: {
        name: 'Martin',
        url,
      },
    });
  }

  async sendConfirmAccountEmail(user: UserEmailDto): Promise<boolean> {
    const emailDto = new EmailDto();
    emailDto.user_id = user.id;
    emailDto.subject =
      'Valider votre adresse e-mail pour finaliser votre demande d’inscription';
    emailDto.body = './confirm-account';

    await this.create(emailDto);

    const url = `${CLIENT_DOMAINE}login/${user.valid_or_reset_token}`;

    await this.mailerService.sendMail({
      to: user.email ?? '',
      from: this.configService.get<string>('EMAIL_FROM'), // override default from
      subject: emailDto.subject,
      template: emailDto.body, // either change to ./transactional or rename transactional.html to confirmation.html
      context: {
        name: `${user.first_name} ${user.last_name}`,
        url,
      },
    });

    return true;
  }

  async sendForgetPasswordEmail(user: UserEmailDto) {
    const emailDto = new EmailDto();
    emailDto.user_id = user.id;
    emailDto.subject = 'Modification de votre mot de passe';
    emailDto.body = './reset-password';

    await this.create(emailDto);

    const url = `${CLIENT_DOMAINE}forget/password/${user.valid_or_reset_token}`;

    await this.mailerService.sendMail({
      to: user.email ?? '',
      from: this.configService.get<string>('EMAIL_FROM'), // override default from
      subject: emailDto.subject,
      template: emailDto.body, // either change to ./transactional or rename transactional.html to confirmation.html
      context: {
        name: `${user.first_name} ${user.last_name}`,
        url,
      },
    });
  }

  async sendSuccessPasswordResetEmail(user: UserEmailDto) {
    const emailDto = new EmailDto();
    emailDto.user_id = user.id;
    emailDto.subject = 'Confirmation de changement de mot de passe';
    emailDto.body = './success-reset';

    await this.create(emailDto);

    const url = `${CLIENT_DOMAINE}#/login`;

    await this.mailerService.sendMail({
      to: user.email ?? '',
      from: this.configService.get<string>('EMAIL_FROM'), // override default from
      subject: emailDto.subject,
      template: emailDto.body, // either change to ./transactional or rename transactional.html to confirmation.html
      context: {
        name: `${user.first_name} ${user.last_name}`,
        url,
      },
    });
  }

  async sendSuccessValidationEmail(user: UserEmailDto) {
    const emailDto = new EmailDto();
    emailDto.user_id = user.id;
    emailDto.subject = 'Compte validé';
    emailDto.body = './success-validate';

    await this.create(emailDto);

    const url = `${CLIENT_DOMAINE}auth/login?token=${user.valid_or_reset_token}`;

    await this.mailerService.sendMail({
      to: user.email ?? '',
      from: this.configService.get<string>('EMAIL_FROM'), // override default from
      subject: emailDto.subject,
      template: emailDto.body, // either change to ./transactional or rename transactional.html to confirmation.html
      context: {
        name: `${user.first_name} ${user.last_name}`,
        url,
      },
    });
  }

  async inviteMail(email: string, user: UserEmailDto, qrcode: any) {
    const emailDto = new EmailDto();
    emailDto.user_id = user.id;
    emailDto.subject = `Invitation à s'inscrire sur ClicknMatch`;
    emailDto.body = './invite-account';
    const imgname: string | undefined = (qrcode as { qrname?: string })?.qrname;

    await this.create(emailDto);

    const url = `${CLIENT_DOMAINE}register/${user.slug}`;
    // console.log(imageurl);
    // const imageURL = 'https://i.imgur.com/KO1vcE9.png'; //new SafeString(imageurl);

    await this.mailerService.sendMail({
      to: email,
      from: this.configService.get<string>('EMAIL_FROM'), // override default from
      subject: emailDto.subject,
      template: emailDto.body, // either change to ./transactional or rename transactional.html to confirmation.html
      context: {
        name: `${user.first_name} ${user.last_name}`,
        url,
        imgname,
      },
    });
  }

  async rendezvousMail(
    email: string,
    user: UserEmailDto,
    agent: UserEmailDto,
    date_rdv: string,
    motif: string,
    adresse: string,
  ) {
    const emailDto = new EmailDto();
    emailDto.user_id = user.id;
    emailDto.subject = `Nouveau rendez-vous sur ClicknMatch`;
    emailDto.body = './rendezvous-validate';
    // const imgname = qrcode.qrname;

    await this.create(emailDto);

    const attendees = [
      {
        email: email,
        name: email.split('@')[0],
        rsvp: true,
        role: ICalAttendeeRole.REQ,
        type: ICalAttendeeType.INDIVIDUAL,
      },
      {
        email: agent.email ?? '',
        name: email.split('@')[0],
        rsvp: true,
        role: ICalAttendeeRole.REQ,
        type: ICalAttendeeType.INDIVIDUAL,
      },
    ];

    const calendar = ical({
      name: 'Rendez-vous',
    });
    const event = calendar.createEvent({
      start: new Date(date_rdv),
      end: new Date(new Date(date_rdv).getTime() + 1 * 3600000 + 30 * 60000),
      summary: motif,
      description: '-',
      location: adresse,
      status: ICalEventStatus.CONFIRMED,
      organizer: {
        name: `${agent.first_name} ${agent.last_name}`,
        email: agent.email ?? '',
        mailto: agent.email ?? '',
      },
      attendees: attendees,
      url: CLIENT_DOMAINE,
    });

    event.createAlarm({
      // type: 'display',
      trigger: 300, // 5 minutes before
      description: 'Reminder: ' + motif,
    });

    const icalEvent = calendar.toString();

    // const url = `${CLIENT_DOMAINE}register/${user.slug}`;
    // console.log(imageurl);
    // const imageURL = 'https://i.imgur.com/KO1vcE9.png'; //new SafeString(imageurl);
    const date = moment(date_rdv).locale('fr').format('LLLL'); //toUTCString()
    // console.log(date);

    await this.mailerService.sendMail({
      to: email,
      from: this.configService.get<string>('EMAIL_FROM'), // override default from
      subject: emailDto.subject,
      template: emailDto.body, // either change to ./transactional or rename transactional.html to confirmation.html
      context: {
        name: `${user.first_name} ${user.last_name}`,
        // url,
        // imgname,
        agent_name: `${agent.first_name} ${agent.last_name}`,
        date_rdv: date,
        motif,
      },
      alternatives: [{ contentType: 'text/calendar', content: icalEvent }],
    });
  }

  async rendezvousMailConfirm(
    email: string,
    user: UserEmailDto,
    agent: UserEmailDto,
    date_rdv: string,
    motif: string,
  ) {
    const emailDto = new EmailDto();
    emailDto.user_id = user.id;
    emailDto.subject = `Invitation à s'inscrire sur ClicknMatch`;
    emailDto.body = './rendezvous-validate';
    // const imgname = qrcode.qrname;

    await this.create(emailDto);

    const attendees = [
      {
        email: email,
        name: email.split('@')[0],
        rsvp: true,
        role: ICalAttendeeRole.REQ,
        type: ICalAttendeeType.INDIVIDUAL,
      },
      {
        email: agent.email ?? '',
        name: email.split('@')[0],
        rsvp: true,
        role: ICalAttendeeRole.REQ,
        type: ICalAttendeeType.INDIVIDUAL,
      },
    ];

    const calendar = ical({
      name: 'My Cal',
    });
    const event = calendar.createEvent({
      start: new Date(date_rdv),
      end: new Date(new Date(date_rdv).getTime() + 1 * 3600000 + 30 * 60000),
      summary: motif,
      description: '-',
      location: 'Lome',
      status: ICalEventStatus.CONFIRMED,
      organizer: {
        name: `${agent.first_name} ${agent.last_name}`,
        email: agent.email ?? '',
        mailto: agent.email ?? '',
      },
      attendees: attendees,
      url: CLIENT_DOMAINE,
    });

    event.createAlarm({
      // type: 'display',
      trigger: 300, // 5 minutes before
      description: 'Reminder: ' + motif,
    });

    const icalEvent = calendar.toString();

    // const url = `${CLIENT_DOMAINE}register/${user.slug}`;
    // console.log(imageurl);
    // const imageURL = 'https://i.imgur.com/KO1vcE9.png'; //new SafeString(imageurl);
    const date = moment(date_rdv).locale('fr').format('LLLL'); //toUTCString()
    // console.log(date);

    await this.mailerService.sendMail({
      to: email,
      from: this.configService.get<string>('EMAIL_FROM'), // override default from
      subject: emailDto.subject,
      template: emailDto.body, // either change to ./transactional or rename transactional.html to confirmation.html
      context: {
        name: `${user.first_name} ${user.last_name}`,
        // url,
        // imgname,
        agent_name: `${agent.first_name} ${agent.last_name}`,
        date_rdv: date,
        motif,
      },
      alternatives: [{ contentType: 'text/calendar', content: icalEvent }],
    });
  }

  async demandeInscriptionMail(emails: string[], user: UserEmailDto) {
    for (const email of emails) {
      const emailDto = new EmailDto();
      emailDto.user_id = user.id;
      emailDto.subject = `Nouvelle demande d'inscription sur ClicknMatch`;
      emailDto.body = './demande-inscription';

      await this.create(emailDto);

      const url = `${CLIENT_DOMAINE}auth/invitation?token=${user.slug}`;

      await this.mailerService.sendMail({
        to: email,
        from: this.configService.get<string>('EMAIL_FROM'), // override default from
        subject: emailDto.subject,
        template: emailDto.body, // either change to ./transactional or rename transactional.html to confirmation.html
        context: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          url,
        },
      });
    }
  }

  async sendConvocationMail(convocation: ConvocationMailDto) {
    const emailDto = new EmailDto();
    emailDto.user_id = convocation.id;
    emailDto.subject = 'Convocation à un évènement';
    emailDto.body = './email-convocation';

    await this.create(emailDto);

    const url = `${this.configService.get<string>('FRONTEND_URL')}${convocation.slug}`;

    await this.mailerService.sendMail({
      to: convocation.email,
      from: this.configService.get<string>('EMAIL_FROM'), // override default from
      subject: emailDto.subject,
      template: emailDto.body, // either change to ./transactional or rename transactional.html to confirmation.html
      context: {
        name: convocation.name,
        membre: convocation.membre,
        date_debut: convocation.date_debut,
        heure_debut: convocation.heure_debut,
        date_fin: convocation.date_fin,
        heure_fin: convocation.heure_fin,
        evenement: convocation.evenement,
        url,
      },
    });
  }
}
