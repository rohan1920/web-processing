import { Module } from '@nestjs/common';
import { DataUploadController } from './data-upload.controller';
import { DataUploadService } from './data-upload.service';

@Module({
  controllers: [DataUploadController],
  providers: [DataUploadService],
  exports: [DataUploadService],
})
export class DataUploadModule {}

