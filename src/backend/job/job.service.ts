import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { Config } from '../../lib/config';

import { globFiles } from '../../lib/utils';
import * as uuid from 'uuid'
import { CsvFile, detectFileEncoding, Preset } from '../../lib';
import { Job } from '../../lib';

@Injectable()
export class JobService {
	jobs={};
	getJobs() {
	}
	deleteJob(entity: any) {

	}
	async createJob(entity: any, csvFilePath: string, presetFilePath: any) {
		const csvFile = new CsvFile();
		const preset = new Preset();
		const job = new Job(csvFile, preset);
		try {
			const detectedTextEncoding = await detectFileEncoding(csvFilePath);
			await preset.loadFromFile(presetFilePath);
			await csvFile.startReadLines(csvFilePath, detectedTextEncoding);
			this.jobs[job.id] = job; 
			return job.data();
		} finally {
			
		}

	}
	config: Config;
	idByFilePath: {};
	fileDataById: {};
	/**
	 *
	 */
	constructor() {
		this.config = global['_config'];
		this.idByFilePath = {};
		this.fileDataById = {};
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
			this.fileDataById[id] = { id, filePath, name };
			return this.fileDataById[id];
		}));

	}
	getJob(  id) { 
		const job=this.jobs[id];
		return job?.data();
	 }
}
