import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { Config } from '../../lib/config';
import { detectFileEncoding } from '../../lib/text-encoding';
import { globFiles } from '../../lib/utils';
import * as uuid from 'uuid'
import { stat } from 'fs-extra';
import * as humanSize from 'human-size'
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
	  
}
