import { Controller, Get } from '@nestjs/common';
import { FilesService } from './files.service';
@Controller('/files')
export class FilesController {
	constructor(private readonly service: FilesService ) { }

	@Get('/')
	getItemsInBriefCase() {
		return this.service.getFiles();
	}
	 
}
