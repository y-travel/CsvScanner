import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CsvFile, Preset } from '../../lib';
import { FileService } from '../file';
import { PresetService } from '../preset';
import { JobService } from './job.service';
import { detectFileEncoding } from '../../lib';
@Controller('/jobs')
export class JobsController {
	constructor(private readonly service: JobService,
		private readonly fileService: FileService,
		private readonly presetService: PresetService) {


	}


	@Get('/')
	getFiles() {

		return this.service.getJobs();
	}

	@Post()
	async createJob(@Body() entity: any) {
		const file = this.fileService.getFile(entity.fileId);
		const preset = this.presetService.getFile(entity.presetId);
		return this.service.createJob(entity, file.filePath,preset.filePath);
	}
	@Delete()
	deleteJob(@Param('id') id: string) {
		return this.service.deleteJob(id);

	}
	@Get(':id')
	getJob(@Param('id') id: string){
		
	}
	@Get(':id/live')
	getLiveData(@Param('id') id: string, @Query('cat') cat: string, @Query('start') start: string) {
		return { cat, start, id };
	}
}
