import { Body, Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AiProcessingService } from './ai-processing.service';
import { aiProcessRequestSchema } from './dto/ai-process.request';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

interface AuthenticatedRequest {
  user?: { id?: string; sub?: string };
}

@ApiTags('AiProcessing')
@ApiBearerAuth()
@Controller('documents')
export class AiProcessingController {
  constructor(private readonly service: AiProcessingService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':documentId/ai/process')
  @ApiOperation({ summary: 'Queue asynchronous AI summarization + tag generation for a document' })
  @ApiParam({ name: 'documentId', example: '123' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string', example: 'hello world', minLength: 1 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Job queued successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async process(
    @Param('documentId') documentId: string,
    @Body() body: unknown,
    @Request() req: AuthenticatedRequest,
  ) {
    const parsed = aiProcessRequestSchema.parse(body);
    const requestedBy = String(req.user?.id ?? req.user?.sub ?? '');

    const { jobId } = await this.service.enqueueDocumentProcessing({
      documentId,
      text: parsed.text,
      requestedBy,
    });

    return {
      data: { jobId, documentId },
      meta: { queued: true },
    };
  }
}
