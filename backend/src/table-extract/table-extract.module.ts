import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TableExtractController } from './table-extract.controller';
import { TableExtractService } from './table-extract.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TableExtractController],
  providers: [TableExtractService],
  exports: [TableExtractService],
})
export class TableExtractModule {}

