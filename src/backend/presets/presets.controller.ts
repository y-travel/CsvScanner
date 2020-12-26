import { Controller, Get } from '@nestjs/common';
import { PresetsService } from './presets.service';

@Controller('/presets')
export class PresetController {
	constructor(private readonly service: PresetsService) { }

	 
	@Get('/')
	getFiles() {
		return this.service.getFiles();
	}
}
