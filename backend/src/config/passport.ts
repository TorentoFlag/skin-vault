import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import { env } from './env.ts';

passport.use(
  new SteamStrategy(
    {
      returnURL: `${env.CLIENT_URL}/auth/steam/callback`,
      realm: `${env.CLIENT_URL}/`,
      apiKey: env.STEAM_API_KEY,
    },
    (_identifier, profile, done) => {
      // Прокидываем _json из Steam-профиля как user
      const { steamid, personaname, avatarfull } = profile._json;
      done(null, { steamId: steamid, displayName: personaname, avatar: avatarfull });
    },
  ),
);

export { passport };
