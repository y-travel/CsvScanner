import { readFile } from "fs/promises";
import { parseXmlString } from "libxmljs";

export class Config{
 csvFilePaths: string[];
    presetFilePaths: string[];
    serverPort: string;
    jobFilePaths: string[];
 /**
  *
  */
 constructor() {
      

 }  
 async loadFromFile(xmlFilePath:string){   
    const contents=await  readFile(xmlFilePath,{encoding:'utf-8'})
    const doc=parseXmlString(contents);

    this.csvFilePaths =  Array.from(  doc.find('//CsvFiles'))
        .map(elm=>elm.attr('Path'))
        .filter(Boolean)
        .map(attr=>attr.value());

    this.presetFilePaths =  Array.from(  doc.find('//PresetFiles'))
        .map(elm=>elm.attr('Path'))
        .filter(Boolean)
        .map(attr=>attr.value());

    this.jobFilePaths =  Array.from(  doc.find('//JobFiles'))
        .map(elm=>elm.attr('Path'))
        .filter(Boolean)
        .map(attr=>attr.value());

    const serverElm=doc.get('//Server');
    [this.serverPort] = [serverElm.attr('Port')].filter(Boolean).map(attr=>attr.value());
 }

}