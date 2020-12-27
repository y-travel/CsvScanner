import { Controller, Get } from '@nestjs/common';
import { PresetService } from './preset.service';

@Controller('/presets')
export class PresetController {
	constructor(private readonly service: PresetService) { }

	 
	@Get('/')
	getFiles() {
		return this.service.getFiles();
	}
}
