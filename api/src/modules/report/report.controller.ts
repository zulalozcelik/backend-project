import { Controller, Post, Req, HttpCode, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiConsumes,
    ApiBody,
    ApiResponse,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { ReportService } from './report.service';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post('upload')
    @HttpCode(202)
    @UseGuards(RateLimitGuard)
    @RateLimit({ limit: 5, window: 60 })
    @ApiOperation({
        summary: 'Stream-upload a large file for report generation',
        description:
            'Pipes the multipart file stream directly to disk — never loaded into RAM. ' +
            'Returns 202 Accepted immediately with a BullMQ jobId. ' +
            'Rate limited to 5 requests per 60 s per user/IP.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    })
    @ApiResponse({ status: 202, description: 'File accepted and queued for processing' })
    @ApiResponse({ status: 400, description: 'No file provided or upload failed' })
    @ApiResponse({ status: 413, description: 'File exceeds 2 GB limit' })
    @ApiResponse({ status: 429, description: 'Too many upload requests — rate limited' })
    async upload(@Req() req: FastifyRequest) {
        return this.reportService.streamUploadToDisk(req);
    }
}
