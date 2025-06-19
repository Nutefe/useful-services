import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthServicesService } from '../../auth-services.service';
import { GoogleProfile } from '../../users/entities/google-profile.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthServicesService) {
    super({
      clientID:
        process.env.GOOGLE_CLIENT_ID ??
        '577612307095-d7bh11tu8d5akdt71cv007ph745m0nnr.apps.googleusercontent.com',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ??
        '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',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3005/api/auth/v1/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<any> {
    // profile contient l'email, le nom, etc.
    const user = await this.authService.validateGoogleUser(profile);
    done(null, user);
  }
}
