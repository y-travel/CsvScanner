import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { Config } from '../../lib/config';

import { globFiles } from '../../lib/utils';
import * as uuid from 'uuid'
import { CsvFile, detectFileEncoding, ILoadRows, Preset } from '../../lib';
import { Job } from '../../lib';
@Injectable()
export class JobService {
	jobs: Record<string, Job> = {};
	baseDir: string;
	config: Config;
	loadComplete: boolean = false;
	async getJobs() {
		const jobs = await this.loadFiles();
		return jobs.map(job => job.data())
	}

	deleteJob(entity: any) {

	}
	async createJob(entity: any, csvFilePath: string, presetFilePath: any) {
		const preset = new Preset();
		const rootDir = this.baseDir.split('/').filter(s => !/\*/.test(s)).join('/');
		const job = new Job(rootDir);
		try {
			await preset.loadFromFile(presetFilePath);
			this.jobs[job.id] = job;
			job.start(csvFilePath, preset);
			return { id: job.id }
		} finally {

		}

	}
	idByFilePath: {};
	fileDataById: {};
	/**
	 *
	 */
	constructor() {
		this.config = global['_config'];
		this.idByFilePath = {};
		this.fileDataById = {};
		[this.baseDir] = this.config.jobFilePaths.slice(-1).map(path.dirname);
	}

	accquireFileId(filePath) {
		const id = this.idByFilePath[filePath];
		if (id) return id;
		this.idByFilePath[filePath] = uuid.v4();
		return this.idByFilePath[filePath];
	}
	async loadFiles(id?: string) {
		const files = await globFiles(this.config.jobFilePaths);
		return await Promise.all(files.filter(filePath => id ? filePath.includes(id) : true).map(async filePath => {

			const job = new Job(path.dirname(filePath));;
			return job.loadFromFile(filePath);
		}));
	}
	async getJob(id) {
		const jobs = await this.loadFiles(id);

		const [job] = jobs.filter(job => job.id == id);
		return job?.data();
	}

	async getLiveRows(p: ILoadRows) {
		const jobs = await this.loadFiles(p.id);
		const [job] = jobs.filter(job => job.id == p.id);
		return job.liveRows(p);
	}
	async getLiveItems(p: ILoadRows) {
		const lines = await this.getLiveRows(p);
		return lines.map(line => line.split(','));
	}
}
