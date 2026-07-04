import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { Role } from '../../../../shared/guards/roles.enum';
import { ImportCustomersUseCase } from '../../application/use-cases/import-customers.usecase';
import { ImportResultResponseDto } from '../../application/dto/import-result-response.dto';
import { ImportResultMapper } from '../../application/mappers/import-result.mapper';

interface UploadedExcelFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@ApiTags('ExcelImport')
@ApiBearerAuth('bearerAuth')
@Roles(Role.ADMIN)
@Controller('excel-import')
export class ExcelImportController {
  constructor(
    private readonly importCustomersUseCase: ImportCustomersUseCase,
  ) {}

  @Post('customers')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({
    summary: 'Excel faylından toplu müştəri idxalı (yalnız admin)',
  })
  @ApiResponse({ status: 201, type: ImportResultResponseDto })
  async importCustomers(
    @UploadedFile() file: UploadedExcelFile,
  ): Promise<ImportResultResponseDto> {
    if (!file) {
      throw new BadRequestException('Fayl yüklənməyib');
    }

    const result = await this.importCustomersUseCase.execute(file.buffer);
    return ImportResultMapper.toResponseDto(result);
  }
}
