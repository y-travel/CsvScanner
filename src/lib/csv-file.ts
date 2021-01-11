import { EventEmitter } from 'events';
import { createReadStream } from 'fs';
import { TextEncoding } from './text-encoding';

export class CsvFile extends EventEmitter {
    fieldNames: string[];
    initalFilePosition: number
    /**
     *
     */
    constructor( ) {
        super()
        this.fieldNames = null as any;
        this.initalFilePosition = 0;
    }
    async startReadLines(filePath: string,textEncoding: TextEncoding) {
        let lineIndex = 0;
        let filePosition = this.initalFilePosition;
        const fileStream = createReadStream(filePath, { start: filePosition });
        const scanner = textEncoding.openLineScanner(fileStream);
        const newLineSize = textEncoding.getNewLineSize();
        try {
            for await (const line of scanner) {
                if (!this.fieldNames) {
                    this.fieldNames = line.trim().split(',');
                    this.emit('fields',{fields : this.fieldNames});
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
                    lineIndex++;
                }
                filePosition +=   textEncoding.computeStringSize(line) + newLineSize;
            }
            
        } finally {
            this.emit('end', {totalLines: lineIndex, filePosition,fields:this.fieldNames});
            scanner.close();
            fileStream.close();
        }
    }
}