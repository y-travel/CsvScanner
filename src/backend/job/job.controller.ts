import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { FileService } from '../file';
import { JobService } from './job.service';

@Controller('/jobs')
export class JobsController {
	constructor(private readonly service: JobService,
			private  readonly files:FileService, private readonly presetService:PresetService  ) { }

	 
	@Get('/')
	getFiles() {
		return this.service.getJobs();
	}

	@Post()
	createJob(@Body() entity:any){
		return this.service.createJob(entity);
	}
	@Delete()
	deleteJob(@Param('id') id:string){
		return this.service.deleteJob(id);
		
	}
	@Get(':id/live')
	getLiveData(@Param('id') id:string,@Query('cat') cat:string,@Query('start') start:string) {
		return {cat,start,id};
	}
}
