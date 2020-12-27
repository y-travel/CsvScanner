import { Controller, Get } from '@nestjs/common';
import { FileService } from './file.service';
@Controller('/files')
export class FilesController {
	constructor(private readonly service: FileService ) { }

	@Get('/')
	getItemsInBriefCase() {
		return this.service.getFiles();
	}
	 
}
