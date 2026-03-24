import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginInput, RegisterInput } from './models/auth.inputs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private mapUser(user: any) {
    return {
      ...user,
      avatar: user.avatar ?? undefined,
      // ?? undefined converte null in undefined che è quello che si aspetta GraphQL
      bio: user.bio ?? undefined,
    };
  }

  async register(input: RegisterInput) {
    // Controlla se email o username sono già in uso
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }],
        // OR = almeno una delle condizioni deve essere vera
      },
    });

    if (existing) {
      throw new ConflictException('Email o username già in uso');
      // ConflictException = HTTP 409, indica un conflitto con lo stato attuale
    }

    // Hash della password — bcrypt aggiunge automaticamente un "salt" random
    // il numero 12 è il "cost factor" — più alto = più sicuro ma più lento
    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash,
      },
    });

    const accessToken = this.generateToken(user.id, user.email);
    return { accessToken, user: this.mapUser(user) };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      // Messaggio vago intenzionalmente — non rivelare se l'email esiste o no
      throw new UnauthorizedException('Credenziali non valide');
    }

    // Confronta la password inviata con l'hash salvato nel database
    const isValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    const accessToken = this.generateToken(user.id, user.email);
    return { accessToken, user: this.mapUser(user) };
  }

  private generateToken(userId: number, email: string): string {
    return this.jwtService.sign({
      sub: userId, // sub = subject, convenzione JWT per l'ID utente
      email,
    });
  }
}
