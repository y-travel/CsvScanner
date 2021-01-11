import { writeFile } from "fs/promises";
import { stringify, parse } from "hjson";
import { CsvFile } from "./csv-file";
import { Preset } from "./preset";
import * as uuid from 'uuid';
import getTextEncoding, { detectFileEncoding } from "./text-encoding";
import { createReadStream, existsSync, fstatSync, mkdir, readFile, readJSONSync, statSync } from "fs-extra";
import { Indexer } from "./indexer";
import * as path from "path";
import { asyncDelay } from "./utils";

export class Job {
   id: string;
   baseDir: string;
   fileFooter: string;
   data() {
      return { ...this.recentIndexFileData, filePath: this.filePath };
   }
   timerId: NodeJS.Timeout;
   recentIndexFileData: any;
   filePath: string;
   /**
    *
    */
   constructor(rootDir: string) {
      this.id = uuid.v4();
      this.baseDir = path.join(...[/^\.\//.test(rootDir) && process.cwd(), rootDir, this.id].filter(Boolean))
      this.filePath = path.join(this.baseDir, 'job.json');
      this.fileFooter = "//__Job__File";
   }
   async updateIndexFile(delta) {
      const data = {
         ...this.recentIndexFileData,
         ...delta,
         id: this.id
      };
      const rawData = [JSON.stringify(data, null, 4), this.fileFooter].join("\n\r");
      this.recentIndexFileData = data;
      if (this.filePath)
         await writeFile(this.filePath, rawData, 'utf-8');


   }
   async loadFromFile(filePath: string) {
      this.filePath = filePath;
      if (!existsSync(filePath)) {
         this.recentIndexFileData = {};
         return;
      }
      for (let i = 0, len = 3; i < len; i++) {

         const fileContents = await readFile(filePath, 'utf-8');
         if (typeof fileContents == 'string' &&
            fileContents.includes(this.fileFooter)) {
            this.recentIndexFileData = parse(fileContents);
         }
         if(this.recentIndexFileData) break;
         await asyncDelay(100);
      }
      this.id = this.recentIndexFileData.id;
      this.baseDir = path.dirname(filePath);
      return this;
   }

   async start(csvFilePath: string, preset: Preset) {
      if (!existsSync(this.baseDir)) {
         await mkdir(this.baseDir);
      }
      const csvFile = new CsvFile();
      const indexerByCat: Record<string, Indexer> = Object.fromEntries(await Promise.all(
         preset.categories.map(async (category) => {
            const categoryName = category.attributes.name;
            const indexer = new Indexer();
            await indexer.link(path.join(this.baseDir, `${categoryName}.idx`));
            return [categoryName, indexer];
         })));
      const categoryCounters = Object.fromEntries(
         preset.categories.map(category => [category.attributes.name, 0]));
      const fileStat = statSync(csvFilePath);

      // const updateTimerHandle = setInterval(this.updateIndexFile.bind(this), 1000);
      try {
         this.updateIndexFile({ csvFilePath, progress: 0, categoryCounters, presetFilePath: preset.filePath });
         csvFile.on('fields', this.updateIndexFile.bind(this));
         csvFile.on('data', async (target) => {
            const { item, lineIndex, filePosition } = target;
            const categories = preset.processRow(item);
            await Promise.all(categories.map(async (category) => {
               const categoryName = category.attributes.name;
               const indexer = indexerByCat[categoryName];
               const { categoryCounters } = this.recentIndexFileData;
               categoryCounters[categoryName] =
                  categoryCounters[categoryName] || 0;
               categoryCounters[categoryName] =
                  categoryCounters[categoryName] + 1;
               if (category.attributes.limit && indexer.counter > category.attributes.limit)
                  return;
               if (indexer instanceof Indexer) {
                  if (category.canIndex(target))
                     await indexer.indicate(filePosition);
               }
               else throw new Error(`${categoryName} indexer not found`);

            }

            ));
            const progress = 100 * (filePosition / fileStat.size);
            Object.assign(this.recentIndexFileData, { lineIndex, progress, filePosition });
            if (lineIndex % 100 == 0) {
               await this.updateIndexFile({});
            }
         });
         csvFile.on('end', async () => {
            await asyncDelay(100);
            await  this.updateIndexFile({ progress: 100 });
         });
         const detectedTextEncoding = await detectFileEncoding(csvFilePath);
         this.updateIndexFile({ encoding: detectedTextEncoding });
         return csvFile.startReadLines(csvFilePath, getTextEncoding(detectedTextEncoding));
      } finally {
         // clearInterval(updateTimerHandle);
      }
   }
   async liveRows(p: ILoadRows): Promise<string[]> {
      const textEncoding = getTextEncoding(p.textEncoding || this.recentIndexFileData.encoding);
      const indexName = p.categoryName || 'AllData';
      const indexer = new Indexer();
      const lines: string[] = [];
      await indexer.link(path.join(this.baseDir, `${indexName}.idx`), 'r+');
      const { csvFilePath } = this.recentIndexFileData;
      if (!p.categoryName) {
         const start = await indexer.read(Math.floor(p.offset / 100));
         let skipCount = p.offset % 100;
         const fileStream = createReadStream(csvFilePath, { start });
         const scanner = textEncoding.openLineScanner(fileStream);
         try {
            for await (const line of scanner) {
               if (skipCount > 0) {
                  skipCount--;
                  continue;
               }
               lines.push(line);
               if (lines.length >= p.limit) break;
            }
         } finally {
            fileStream.close();
            scanner.close();
         }
      }
      else {
         for (let rowIndex = 0, len = p.limit; rowIndex <= len; rowIndex++) {
            const start = await indexer.read(p.offset + rowIndex);
            if (start < 0) continue;
            const fileStream = createReadStream(csvFilePath, { start });
            const scanner = textEncoding.openLineScanner(fileStream);
            try {
               const line = await scanner.next();
               lines.push(line);
            } finally {
               fileStream.close();
               scanner.close();
            }
         }
      }
      return lines;

   }

   handleUpdateFields(fields) {
      this.updateIndexFile({ fields });
   }


}

export interface ILoadRows {
   id: string;
   categoryName: string;
   offset: number;
   limit: number;
   csvFilePath?: string;
   textEncoding?: string;
}