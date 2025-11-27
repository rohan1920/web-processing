import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { TableExtractModule } from './table-extract/table-extract.module';
import { DataUploadModule } from './data-upload/data-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UploadModule,
    TableExtractModule,
    DataUploadModule,
  ],
})
export class AppModule {}

