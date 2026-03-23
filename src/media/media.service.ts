import { Injectable } from '@nestjs/common';
import { MediaType } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}
  // NestJS inietta automaticamente PrismaService grazie a @Injectable e @Global

  // Recupera tutti i media con filtri opzionali
  async findAll(filters?: {
    type?: MediaType;
    search?: string;
    limit?: number;
  }) {
    return this.prisma.media.findMany({
      where: {
        // se type è undefined, Prisma ignora il filtro
        type: filters?.type,
        // se search è definito, cerca nel titolo con CONTAINS (case-insensitive)
        titleRomaji: filters?.search
          ? { contains: filters.search, mode: 'insensitive' }
          : undefined,
      },
      take: filters?.limit ?? 20,
      // take = LIMIT in SQL — di default ritorna max 20 risultati
      orderBy: { popularity: 'desc' },
      // ordina per popolarità decrescente
    });
  }

  // Recupera un singolo media per ID
  async findOne(id: number) {
    return this.prisma.media.findUnique({
      where: { id },
      include: {
        genres: true,
        tags: true,
        // include = JOIN in SQL — carica anche le relazioni
      },
    });
  }

  // Crea un nuovo media
  async create(data: {
    type: MediaType;
    titleRomaji: string;
    titleEnglish?: string;
    titleNative?: string;
    description?: string;
    episodes?: number;
    chapters?: number;
  }) {
    return this.prisma.media.create({ data });
  }
}
