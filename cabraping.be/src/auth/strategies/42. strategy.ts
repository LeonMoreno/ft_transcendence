import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'strategy') {
  constructor() {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID:
        'u-s4t2ud-ad380d1e29d12f0620c006a5c2614ef1c4044252bc297508f1585de0d3cfd091',
      clientSecret:
        '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',
      callbackURL: 'http://localhost:3007/auth/42/redirect',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile ) {
    console.log('42 strategy validate');
    console.log(`access_Token = ${accessToken}`);
    console.log(`refresh_Token = ${refreshToken}`);
    console.log(`profile = ${profile}`);
  }
}
