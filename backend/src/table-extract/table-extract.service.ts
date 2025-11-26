import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import * as path from 'path';
import * as fs from 'fs';
import { TableExtractResponseDto } from './dto/table-extract-response.dto';

@Injectable()
export class TableExtractService {
  private readonly pythonServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pythonServiceUrl =
      this.configService.get('PYTHON_SERVICE_URL') || 'http://localhost:8000';
    console.log(`[TableExtractService] Initialized with Python service URL: ${this.pythonServiceUrl}`);
  }

  async extractTablesFromPdf(
    filePath: string,
  ): Promise<TableExtractResponseDto> {
    if (!filePath) {
      throw new HttpException(
        'File path is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Convert relative path to absolute path
    let absolutePath = filePath;
    if (!path.isAbsolute(filePath)) {
      absolutePath = path.resolve(process.cwd(), filePath);
    }

    // Normalize path separators for Windows
    absolutePath = path.normalize(absolutePath);

    // Verify file exists
    if (!fs.existsSync(absolutePath)) {
      throw new HttpException(
        `File not found: ${absolutePath}`,
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      console.log('========================================');
      console.log('TABLE EXTRACTION REQUEST');
      console.log('========================================');
      console.log(`Python Service URL: ${this.pythonServiceUrl}/extract-tables`);
      console.log(`Original File Path: ${filePath}`);
      console.log(`Absolute File Path: ${absolutePath}`);
      console.log('Request Payload:', JSON.stringify({ file_path: absolutePath }, null, 2));
      console.log('========================================');
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.pythonServiceUrl}/extract-tables`,
          { file_path: absolutePath },
          {
            timeout: 60000,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ).pipe(timeout(60000))
      );
      
      console.log('========================================');
      console.log('TABLE EXTRACTION RESPONSE');
      console.log('========================================');
      console.log('Response Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('========================================');

      console.log(`Table extraction successful. Found ${response.data?.tables?.length || 0} tables`);

      return {
        success: response.data.success || true,
        file_path: response.data.file_path || absolutePath,
        tables: response.data.tables || [],
      };
    } catch (error: any) {
      const errorCode = error?.code || error?.errno || '';
      const errorString = JSON.stringify(error || {});
      const errorMessage = error?.message || String(error) || 'Unknown error';
      const errorResponse = error?.response;
      const errorResponseData = errorResponse?.data;
      
      console.error('========================================');
      console.error('ERROR calling Python service for table extraction');
      console.error('========================================');
      console.error('Error Code:', errorCode);
      console.error('Error Message:', errorMessage);
      console.error('Python Service URL:', `${this.pythonServiceUrl}/extract-tables`);
      console.error('Original File Path:', filePath);
      console.error('Absolute File Path:', absolutePath);
      console.error('File Exists:', fs.existsSync(absolutePath));
      if (errorResponse) {
        console.error('Response Status:', errorResponse.status);
        console.error('Response Data:', JSON.stringify(errorResponseData, null, 2));
      }
      console.error('========================================');
      
      // Handle connection refused
      if (
        errorCode === 'ECONNREFUSED' || 
        errorString.includes('ECONNREFUSED') ||
        errorMessage.includes('ECONNREFUSED')
      ) {
        throw new HttpException(
          `Cannot connect to Python service at ${this.pythonServiceUrl}. Start it with: cd python-service && python api.py`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      
      // Handle 404 - could be endpoint not found OR file not found
      if (errorResponse?.status === 404) {
        const detail = errorResponseData?.detail || errorResponseData?.message || 'Endpoint or file not found';
        throw new HttpException(
          `Python service returned 404: ${detail}. File path sent: ${absolutePath}. Check Python service logs for details.`,
          HttpStatus.NOT_FOUND,
        );
      }
      
      // Handle other errors
      if (errorResponseData?.detail) {
        throw new HttpException(
          errorResponseData.detail,
          errorResponse?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        `Table extraction failed: ${errorMessage}`,
        errorResponse?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
