import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import { env } from './env.ts';

passport.use(
  new SteamStrategy(
    {
      returnURL: `http://localhost:${env.PORT}/api/auth/steam/callback`,
      realm: `http://localhost:${env.PORT}/`,
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
