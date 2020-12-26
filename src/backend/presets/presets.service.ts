import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { Config } from '../../lib/config';
 
import { globFiles } from '../../lib/utils';
import * as uuid from 'uuid'
 
@Injectable()
export class PresetsService {
	config: Config;
	idByFilePath: {};
	fileDataById:{};
	/**
	 *
	 */
	constructor() {
		this.config = global['_config'];
		this.idByFilePath = {};
		this.fileDataById={};
	}
	 
	accquireFileId(filePath) {
		const id = this.idByFilePath[filePath];
		if (id) return id;
		this.idByFilePath[filePath] = uuid.v1();
		return this.idByFilePath[filePath];
	}
	async getFiles() {
		const files = await globFiles(this.config.presetFilePaths);
		return Promise.all(files.map(async filePath => {
			const id = this.accquireFileId(filePath);
			const name = path.basename(filePath);
			this.fileDataById[id]={ id,    filePath,      name };
			return this.fileDataById[id];
		}));
		
	}
	getFile(id){ return this.fileDataById[id] }
}
