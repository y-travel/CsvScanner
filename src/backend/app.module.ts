import { Module } from '@nestjs/common';
import * as home from './home';
import * as files from './file';
import * as preset from './preset';
import * as jobs from './job';

@Module({
  imports: [],
  controllers: [home.AppController ,files.FilesController ,preset.PresetController,jobs.JobsController ],
  providers: [home.AppService,files.FileService,preset.PresetService,jobs.JobService]
})
export class AppModule {}
