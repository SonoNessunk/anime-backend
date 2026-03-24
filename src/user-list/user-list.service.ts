import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserMediaStatus } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddToListInput,
  UpdateListEntryInput,
} from './models/user-list.inputs';

@Injectable()
export class UserListService {
  constructor(private prisma: PrismaService) {}

  // Recupera la lista di un utente con filtro opzionale per status
  async getUserList(userId: number, status?: UserMediaStatus) {
    return this.prisma.userMediaEntry.findMany({
      where: {
        userId,
        status: status ?? undefined,
      },
      include: {
        media: true,
        // include il media collegato per avere titolo, copertina etc. in un'unica query
      },
      orderBy: { updatedAt: 'desc' },
      // ordina per ultimo aggiornamento — gli ultimi guardati/letti prima
    });
  }

  // Aggiunge un media alla lista dell'utente
  async addToList(userId: number, input: AddToListInput) {
    // Verifica che il media esista
    const media = await this.prisma.media.findUnique({
      where: { id: input.mediaId },
    });
    if (!media) throw new NotFoundException('Media non trovato');

    // Verifica che non sia già in lista
    const existing = await this.prisma.userMediaEntry.findUnique({
      where: { userId_mediaId: { userId, mediaId: input.mediaId } },
      // userId_mediaId è il nome del constraint @@unique([userId, mediaId]) nello schema
    });
    if (existing) throw new ConflictException('Media già in lista');

    return this.prisma.userMediaEntry.create({
      data: {
        userId,
        mediaId: input.mediaId,
        status: input.status,
        score: input.score,
        progress: input.progress ?? 0,
        notes: input.notes,
        startDate: input.startDate,
        endDate: input.endDate,
      },
      include: { media: true },
    });
  }

  // Aggiorna un'entry esistente
  async updateEntry(
    userId: number,
    mediaId: number,
    input: UpdateListEntryInput,
  ) {
    const entry = await this.prisma.userMediaEntry.findUnique({
      where: { userId_mediaId: { userId, mediaId } },
    });
    if (!entry) throw new NotFoundException('Entry non trovata');

    return this.prisma.userMediaEntry.update({
      where: { userId_mediaId: { userId, mediaId } },
      data: {
        status: input.status,
        score: input.score,
        progress: input.progress,
        notes: input.notes,
        startDate: input.startDate,
        endDate: input.endDate,
      },
      include: { media: true },
    });
  }

  // Rimuove un media dalla lista
  async removeFromList(userId: number, mediaId: number) {
    const entry = await this.prisma.userMediaEntry.findUnique({
      where: { userId_mediaId: { userId, mediaId } },
    });
    if (!entry) throw new NotFoundException('Entry non trovata');

    await this.prisma.userMediaEntry.delete({
      where: { userId_mediaId: { userId, mediaId } },
    });

    return true;
  }

  // Statistiche della lista utente
  async getStats(userId: number) {
    const entries = await this.prisma.userMediaEntry.groupBy({
      by: ['status'],
      // groupBy raggruppa i risultati per status — come GROUP BY in SQL
      where: { userId },
      _count: { id: true },
      // _count conta quante entry ci sono per ogni status
    });

    return entries.map((e) => ({
      status: e.status,
      count: e._count.id,
    }));
  }
}
