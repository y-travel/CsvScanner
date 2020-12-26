
import { NestFactory } from '@nestjs/core';
import { checkXmlFile } from '../lib/xml-check';
import { AppModule } from '../backend/app.module';
import { Config } from '../lib/config';
export default async function launchServer({ xmlConfigFile }) {
    xmlConfigFile = xmlConfigFile || './config.xml';
    if(!await checkXmlFile(xmlConfigFile)) return;
    const config = new Config();
    global['_config']=config;
    await config.loadFromFile(xmlConfigFile);
    const app = await NestFactory.create(AppModule);
    await app.listen(config.serverPort);
}