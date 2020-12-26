import { Module } from '@nestjs/common';
import * as Home from './home';
import * as Files from './files';
import * as Preset from './presets';

@Module({
  imports: [],
  controllers: [Home.AppController ,Files.FilesController ,Preset.PresetController ],
  providers: [Home.AppService,Files.FilesService,Preset.PresetsService]
})
export class AppModule {}
