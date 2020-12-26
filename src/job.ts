import { writeFile } from "fs/promises";
import { stringify } from "hjson";
import { CsvFile } from "./csv-file";
import { Preset } from "./lib/preset";

export class Job {
   timerId: NodeJS.Timeout;
   recentIndexFileData: any;
   filePath: string;
   /**
    *
    */
   constructor(public csvFile: CsvFile, public preset: Preset) {

   }
   async updateIndexFile(delta) {
      const data = {
         ...this.recentIndexFileData,
         ...delta
      };
      const rawData = stringify(data);
      this.recentIndexFileData = data;
      await writeFile(this.filePath, rawData, 'utf-8');


   }
   start() {
      this.timerId = setInterval(this.updateIndexFile.bind(this), 1000);
      this.csvFile.on('fields',fields=>this.updateIndexFile.bind(this));
      this.csvFile.on('data',({item,lineIndex,filePosition})=>{
          
      });

   }
   handleUpdateFields(fields) {
      this.updateIndexFile({ fields });
   }


}