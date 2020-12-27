import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { Config } from '../../lib/config';
import { detectFileEncoding } from '../../lib/text-encoding';
import { globFiles } from '../../lib/utils';
import * as uuid from 'uuid'
import { stat } from 'fs-extra';
import * as humanSize from 'src/backend/file/node_modules/human-size'
@Injectable()
export class AppService {
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
	getHello(): string {
		return 'Hello World!';
	}
	accquireFileId(filePath) {
		const id = this.idByFilePath[filePath];
		if (id) return id;
		this.idByFilePath[filePath] = uuid.v1();
		return this.idByFilePath[filePath];
	}
	async getFiles() {
		const files = await globFiles(this.config.csvFilePaths);
		return Promise.all(files.map(async filePath => {
			const id = this.accquireFileId(filePath);
			const textEncoding = await detectFileEncoding(filePath);
			const baseName = path.basename(filePath);
			const fileStat=await  stat(filePath);
			this.fileDataById[id]={ id,size:fileStat.size ,humanSize:humanSize(fileStat.size,1), filePath, textEncoding, baseName };
			return this.fileDataById[id];
		}));
		
	}
	getFile(id){ return this.fileDataById[id] }
}
