import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ora funziona perché getRequest() ritorna la vera request Fastify
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  // validate viene chiamato automaticamente da Passport dopo aver verificato il token
  // il payload è il contenuto del JWT (quello che abbiamo messo dentro al momento del login)
  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      // sub = subject, convenzione JWT per l'ID dell'utente
    });

    if (!user) throw new UnauthorizedException('Utente non trovato');

    // quello che ritorniamo qui viene iniettato in req.user in ogni route protetta
    return user;
  }
}
