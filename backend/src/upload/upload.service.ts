import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UploadService {
  private readonly pythonServiceUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pythonServiceUrl =
      this.configService.get('PYTHON_SERVICE_URL') || 'http://localhost:8000';
  }

  async uploadAndExtractPdf(
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    // Validate PDF
    if (!file.mimetype.includes('pdf') && !file.originalname.endsWith('.pdf')) {
      throw new HttpException(
        'Only PDF files are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    // File is already saved by multer, use the path from file
    const filePath = file.path;
    const fileId = this.generateFileId();

    try {
      // Call Python microservice to extract text
      let extractedText: string | undefined;
      try {
        const response = await firstValueFrom(
          this.httpService.post(`${this.pythonServiceUrl}/extract`, {
            file_path: filePath,
          }),
        );

        extractedText = response.data?.extractedText || response.data?.text;
      } catch (error: any) {
        console.error('Error calling Python service:', error.message);
        extractedText = undefined;
      }

      return {
        id: fileId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: filePath,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        extractedText: extractedText,
      };
    } catch (error: any) {
      throw new HttpException(
        `Failed to process file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateFileId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
