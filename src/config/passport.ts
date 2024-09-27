import { PrismaClient, Member } from "@prisma/client";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import passport from "passport";

const prisma = new PrismaClient();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user: Member | null = await prisma.member.findUnique({
        where: { id: jwt_payload.id },
      });

      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err, false);
    }
  })
);
