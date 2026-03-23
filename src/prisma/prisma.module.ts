import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
// @Global rende questo modulo disponibile in tutta l'app senza doverlo importare in ogni modulo
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  // exports = rende PrismaService disponibile agli altri moduli che importano PrismaModule
})
export class PrismaModule {}
