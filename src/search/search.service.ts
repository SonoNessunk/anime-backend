import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'typesense';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: Client;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.client = new Client({
      nodes: [
        {
          host: this.config.getOrThrow('TYPESENSE_HOST'),
          port: parseInt(this.config.getOrThrow('TYPESENSE_PORT')),
          // parseInt converte la stringa "8108" nel numero 8108
          protocol: 'http',
        },
      ],
      apiKey: this.config.getOrThrow('TYPESENSE_API_KEY'),
      connectionTimeoutSeconds: 5,
      // dopo 5 secondi senza risposta considera la connessione fallita
    });
  }

  async onModuleInit() {
    // Crea la collection Typesense all'avvio se non esiste già
    await this.ensureCollection();
  }

  private async ensureCollection() {
    try {
      // Prova a recuperare la collection — se esiste non fa nulla
      await this.client.collections('media').retrieve();
      this.logger.log('Typesense collection "media" already exists');
    } catch {
      // Se non esiste la crea con lo schema dei campi ricercabili
      this.logger.log('Creating Typesense collection "media"...');
      await this.client.collections().create({
        name: 'media',
        fields: [
          { name: 'id', type: 'int32' },
          { name: 'type', type: 'string', facet: true },
          // facet: true = permette di filtrare per questo campo (es. solo ANIME)
          { name: 'titleRomaji', type: 'string' },
          { name: 'titleEnglish', type: 'string', optional: true },
          // optional: true = il campo può essere assente nel documento
          { name: 'titleNative', type: 'string', optional: true },
          { name: 'synonyms', type: 'string[]', optional: true },
          // string[] = array di stringhe, Typesense cerca in tutti gli elementi
          { name: 'status', type: 'string', facet: true },
          { name: 'coverImage', type: 'string', optional: true, index: false },
          // index: false = salva il campo ma non lo indicizza per la ricerca (risparmia spazio)
          { name: 'averageScore', type: 'float', optional: true },
          { name: 'popularity', type: 'int32' },
          { name: 'isAdult', type: 'bool', facet: true },
        ],
        default_sorting_field: 'popularity',
        // ordina i risultati per popolarità di default
      });
      this.logger.log('Typesense collection "media" created');
    }
  }

  // Indicizza tutti i media del database in Typesense
  async indexAll(): Promise<number> {
    this.logger.log('Starting full indexing...');

    const batchSize = 1000;
    // processiamo 1000 media alla volta per non saturare la RAM
    let indexed = 0;
    let skip = 0;

    while (true) {
      const media = await this.prisma.media.findMany({
        take: batchSize,
        skip,
        select: {
          // select = prendi solo i campi che ci servono, non tutto il record
          id: true,
          type: true,
          status: true,
          titleRomaji: true,
          titleEnglish: true,
          titleNative: true,
          synonyms: true,
          coverImage: true,
          averageScore: true,
          popularity: true,
          isAdult: true,
        },
      });

      if (media.length === 0) break;
      // nessun altro record da processare, usciamo dal loop

      const documents = media.map((m) => ({
        id: m.id.toString(),
        type: m.type.toString(),
        status: m.status.toString(),
        titleRomaji: m.titleRomaji,
        titleEnglish: m.titleEnglish ?? '',
        titleNative: m.titleNative ?? '',
        synonyms: m.synonyms,
        coverImage: m.coverImage ?? '',
        averageScore: m.averageScore ?? 0,
        popularity: m.popularity ?? 0,
        isAdult: m.isAdult,
      }));

      await this.client
        .collections('media')
        .documents()
        .import(documents, { action: 'upsert' });
      // action: 'upsert' = aggiorna se esiste, crea se non esiste

      indexed += media.length;
      skip += batchSize;
      this.logger.log(`Indexed ${indexed} documents...`);
    }

    this.logger.log(`Full indexing complete! Indexed ${indexed} documents.`);
    return indexed;
  }

  // Ricerca fuzzy per titolo
  async search(
    query: string,
    filters?: { type?: string; isAdult?: boolean },
    page = 1,
    perPage = 25,
  ) {
    const filterParts: string[] = [];

    if (filters?.type) {
      filterParts.push(`type:=${filters.type}`);
      // := in Typesense = uguaglianza esatta per i facet
    }
    if (filters?.isAdult !== undefined) {
      filterParts.push(`isAdult:=${filters.isAdult}`);
    }

    const results = await this.client
      .collections('media')
      .documents()
      .search({
        q: query,
        // q = query di ricerca
        query_by: 'titleRomaji,titleEnglish,titleNative,synonyms',
        // cerca in questi campi
        filter_by: filterParts.join(' && ') || undefined,
        // && combina più filtri con AND
        sort_by: 'popularity:desc',
        // ordina per popolarità decrescente
        page,
        per_page: perPage,
        num_typos: 2,
        // num_typos: 2 = accetta fino a 2 errori di battitura per parola
        // questo è il cuore della fuzzy search!
      });

    return {
      hits: results.hits?.map((hit) => hit.document) ?? [],
      // hits sono i risultati trovati
      total: results.found,
      page: results.page,
      perPage,
      totalPages: Math.ceil(results.found / perPage),
    };
  }
}
