import {
  Controller,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { TableExtractService } from './table-extract.service';
import { TableExtractResponseDto } from './dto/table-extract-response.dto';

class ExtractTablesRequest {
  file_path: string;
}

@Controller('table-extract')
export class TableExtractController {
  constructor(private readonly tableExtractService: TableExtractService) {}

  @Post()
  async extractTables(
    @Body() body: ExtractTablesRequest,
  ): Promise<TableExtractResponseDto> {
    if (!body.file_path) {
      throw new BadRequestException('file_path is required');
    }

    return await this.tableExtractService.extractTablesFromPdf(body.file_path);
  }
}

