import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { MediaType, MediaStatus, MediaSeason } from '../../generated/prisma';

const ANILIST_API = 'https://graphql.anilist.co';

// Query GraphQL che mandiamo ad AniList per ottenere i dati
const MEDIA_QUERY = `
  query ($page: Int, $perPage: Int, $type: MediaType) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(type: $type, sort: ID) {
        id
        type
        status
        title {
          romaji
          english
          native
        }
        synonyms
        description(asHtml: false)
        coverImage { large }
        bannerImage
        isAdult
        episodes
        duration
        season
        seasonYear
        chapters
        volumes
        averageScore
        popularity
        genres
        tags { name isAdult }
        studios {
          edges {
            isMain
            node { id name isAnimationStudio }
          }
        }
      }
    }
  }
`;

// Mappa lo status AniList al nostro enum Prisma
function mapStatus(status: string): MediaStatus {
  const map: Record<string, MediaStatus> = {
    FINISHED: MediaStatus.FINISHED,
    RELEASING: MediaStatus.RELEASING,
    NOT_YET_RELEASED: MediaStatus.NOT_YET_RELEASED,
    CANCELLED: MediaStatus.CANCELLED,
    HIATUS: MediaStatus.HIATUS,
  };
  return map[status] ?? MediaStatus.NOT_YET_RELEASED;
}

// Mappa la stagione AniList al nostro enum Prisma
function mapSeason(season: string | null): MediaSeason | undefined {
  if (!season) return undefined;
  const map: Record<string, MediaSeason> = {
    WINTER: MediaSeason.WINTER,
    SPRING: MediaSeason.SPRING,
    SUMMER: MediaSeason.SUMMER,
    FALL: MediaSeason.FALL,
  };
  return map[season];
}

@Injectable()
export class AnilistService {
  // Logger di NestJS — stampa messaggi con il nome del servizio come prefisso
  private readonly logger = new Logger(AnilistService.name);

  constructor(private prisma: PrismaService) {}

  // Recupera una pagina di media da AniList
  private async fetchPage(type: 'ANIME' | 'MANGA', page: number) {
    const response = await axios.post(ANILIST_API, {
      query: MEDIA_QUERY,
      variables: { page, perPage: 50, type },
      // perPage: 50 è il massimo consentito da AniList
    });
    return response.data.data.Page;
  }

  // Sincronizza N pagine di anime o manga dal database AniList
  async sync(type: 'ANIME' | 'MANGA', pages = 5): Promise<number> {
    const mediaType = type === 'ANIME' ? MediaType.ANIME : MediaType.MANGA;
    let synced = 0;

    for (let page = 540; page <= pages; page++) {
      this.logger.log(`Syncing ${type} page ${page}/${pages}...`);

      const { media, pageInfo } = await this.fetchPage(type, page);

      for (const item of media) {
        try {
          // upsert = INSERT se non esiste, UPDATE se esiste già (basandosi su anilistId)
          await this.prisma.media.upsert({
            where: { anilistId: item.id },
            update: {
              status: mapStatus(item.status),
              titleRomaji: item.title.romaji ?? '',
              titleEnglish: item.title.english,
              titleNative: item.title.native,
              synonyms: item.synonyms ?? [],
              description: item.description,
              coverImage: item.coverImage?.large,
              bannerImage: item.bannerImage,
              isAdult: item.isAdult ?? false,
              episodes: item.episodes,
              duration: item.duration,
              season: mapSeason(item.season),
              seasonYear: item.seasonYear,
              chapters: item.chapters,
              volumes: item.volumes,
              averageScore: item.averageScore,
              popularity: item.popularity ?? 0,
              // Sync generi — disconnetti tutti e riconnetti quelli aggiornati
              genres: {
                set: [],
                // set: [] disconnette tutti i generi esistenti prima di riconnetterli
                connectOrCreate: (item.genres ?? []).map((name: string) => ({
                  where: { name },
                  create: { name },
                })),
              },
            },
            create: {
              anilistId: item.id,
              type: mediaType,
              status: mapStatus(item.status),
              titleRomaji: item.title.romaji ?? '',
              titleEnglish: item.title.english,
              titleNative: item.title.native,
              synonyms: item.synonyms ?? [],
              description: item.description,
              coverImage: item.coverImage?.large,
              bannerImage: item.bannerImage,
              isAdult: item.isAdult ?? false,
              episodes: item.episodes,
              duration: item.duration,
              season: mapSeason(item.season),
              seasonYear: item.seasonYear,
              chapters: item.chapters,
              volumes: item.volumes,
              averageScore: item.averageScore,
              popularity: item.popularity ?? 0,
              genres: {
                connectOrCreate: (item.genres ?? []).map((name: string) => ({
                  where: { name },
                  create: { name },
                })),
                // connectOrCreate = connette il genere se esiste, altrimenti lo crea
              },
            },
          });
          synced++;
        } catch (err) {
          // Se un singolo media fallisce, logghiamo l'errore e continuiamo
          this.logger.error(`Failed to sync media ${item.id}: ${err.message}`);
        }
      }

      // Se non ci sono altre pagine, fermiamo il loop
      if (!pageInfo.hasNextPage) break;

      // Aspettiamo 1 secondo tra una pagina e l'altra per non spammare l'API AniList
      await new Promise((r) => setTimeout(r, 1000));
    }

    this.logger.log(`Sync complete! Synced ${synced} ${type} entries.`);
    return synced;
  }
}
