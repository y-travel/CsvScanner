import { EventEmitter } from 'events';
import { createReadStream } from 'fs';
import * as  readline from 'readline';
import { TextEncoding } from './lib/text-encoding';

export class CsvFile extends EventEmitter {
    fieldNames: string[];
    initalFilePosition: number
    /**
     *
     */
    constructor(public textEncoding: TextEncoding) {
        super()
        this.fieldNames = null as any;
        this.initalFilePosition = 0;
    }
    async startReadLines(filePath: string) {
        let lineIndex = 0;
        let filePosition = this.initalFilePosition;
        const fileStream = createReadStream(filePath, { start: filePosition });
        const scanner = this.textEncoding.openLineScanner(fileStream);
        const newLineSize = this.textEncoding.getNewLineSize();
        try {
            for await (const line of scanner) {
                if (!this.fieldNames) {
                    this.fieldNames = line.trim().split(',');
                    this.emit('fields', this.fieldNames);
                }
                else {
                    const parts = line.split(',');
                    const item = {};
                    if (parts.length != this.fieldNames.length) {
                        this.emit('invalid-line',{ lineIndex, line, filePosition });
                        continue;
                    }
                    for (let i = 0, len = parts.length; i < len; i++) {
                        item[this.fieldNames[i]] = parts[i];
                    }
                    this.emit('data', {item,line,parts,filePosition,lineIndex})
                }
                filePosition += this.textEncoding.computeStringSize(line) + newLineSize;
                lineIndex++;
            }
            this.emit('end', {totalLines: lineIndex, filePosition,fields:this.fieldNames});
           
        } finally {
            scanner.close();
            fileStream.close();
        }
    }
}