import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { DataResponseDto, ColumnInfo } from './dto/data-response.dto';

@Injectable()
export class DataUploadService {
  async parseFile(file: Express.Multer.File): Promise<DataResponseDto> {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
      throw new HttpException(
        'Only CSV and Excel files are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Read the file
      const workbook = XLSX.readFile(file.path);
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const data: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
        raw: false,
      });

      if (data.length === 0) {
        throw new HttpException(
          'File is empty or has no valid data',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Analyze columns
      const columns = this.analyzeColumns(data);

      // Clean up the uploaded file
      fs.unlinkSync(file.path);

      return {
        success: true,
        filename: file.filename,
        originalName: file.originalname,
        rowCount: data.length,
        columns,
        data,
      };
    } catch (error: any) {
      // Clean up on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Failed to parse file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private analyzeColumns(data: Record<string, any>[]): ColumnInfo[] {
    if (data.length === 0) return [];

    const firstRow = data[0];
    const columns: ColumnInfo[] = [];

    for (const key of Object.keys(firstRow)) {
      // Sample values to determine type
      const samples = data.slice(0, 10).map(row => row[key]).filter(v => v !== '' && v !== null);
      const type = this.inferType(samples);

      columns.push({
        name: key,
        type,
        sample: samples[0],
      });
    }

    return columns;
  }

  private inferType(samples: any[]): 'string' | 'number' | 'date' {
    if (samples.length === 0) return 'string';

    const allNumbers = samples.every(s => {
      const num = parseFloat(String(s).replace(/,/g, ''));
      return !isNaN(num);
    });

    if (allNumbers) return 'number';

    // Check for dates
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{2}-\d{2}-\d{4}$/,
    ];

    const allDates = samples.every(s => {
      const str = String(s);
      return datePatterns.some(p => p.test(str)) || !isNaN(Date.parse(str));
    });

    if (allDates) return 'date';

    return 'string';
  }
}

