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

  async findAllPaginated(filters?: {
    type?: MediaType;
    search?: string;
    page?: number;
    perPage?: number;
  }) {
    const page = filters?.page ?? 1;
    const perPage = filters?.perPage ?? 25;
    const skip = (page - 1) * perPage;
    // skip = quanti record saltare — es. pagina 3 con 25 perPage → skip 50

    const where = {
      type: filters?.type,
      titleRomaji: filters?.search
        ? { contains: filters.search, mode: 'insensitive' as const }
        : undefined,
    };

    // Eseguiamo due query in parallelo con Promise.all per efficienza
    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        take: perPage,
        skip,
        orderBy: { popularity: 'desc' },
      }),
      this.prisma.media.count({ where }),
      // count = conta i record totali che matchano il filtro
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      items,
      pageInfo: {
        total,
        page,
        perPage,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
