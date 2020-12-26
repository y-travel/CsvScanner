'use strict';

import * as fs from 'fs-extra';
import * as Iconv from 'iconv';
interface IOptions {
    readChunk?: number;
    newLineCharacter?: any;
    encoding?:string;

}
/**
 * @class
 */
export class LineByLine {
    fd: number;
    options: IOptions;
    newLineCharacter: any;
    eofReached: boolean;
    linesCache: Array<{ filePosition: number, line: string }>;
    fdPosition: number;
    readOccuredFdPosition: number;
    iconv: Iconv.Iconv;
    constructor(filePath, options?: IOptions) {
        options = options || {};

        if (!options.readChunk) options.readChunk = 1024;
        if (!options.newLineCharacter) {
            options.newLineCharacter = 0x0a; //linux line ending
        } else {
            options.newLineCharacter = options.newLineCharacter.charCodeAt(0);
        }
        this.fd = fs.openSync(filePath, 'r');
        this.options = options;

        this.newLineCharacter = options.newLineCharacter;
        this.iconv = new (Iconv as any).Iconv(options.encoding ||  'UCS-2LE', 'UTF-8')
        this.reset();
    }

    _searchInBuffer(buffer, hexNeedle) {
        let found = -1;

        for (let i = 0; i <= buffer.length; i++) {
            let b_byte = buffer[i];
            if (b_byte === hexNeedle) {
                found = i;
                break;
            }
        }

        return found;
    }

    reset() {
        this.eofReached = false;
        this.linesCache = [];
        this.fdPosition = 0;
    }

    close() {
        fs.closeSync(this.fd);
        this.fd = null;
    }

    computeLinesCache(buffer) {
        let line;
        const cache: typeof LineByLine.prototype['linesCache'] = [];
        let bufferPosition = 0;
        let filePosition = this.readOccuredFdPosition;
        let lastNewLineBufferPosition = 0;
        //this.hasIsCRLF2=false;
          const pushItem=(bufferPosition)=> {
            const lineBuf: Buffer = buffer.slice(lastNewLineBufferPosition, bufferPosition);
            if(lineBuf.length<3) return;
             
            const currentFilePosition = filePosition - lineBuf.length
            try {
                line = this.iconv.convert(lineBuf).toString();
                if(line && !line.includes(',')){
                    throw new Error("");
                }
            } catch (e) {
                const lineBuf2: Buffer = buffer.slice(lastNewLineBufferPosition + 1, bufferPosition);
                line = this.iconv.convert(lineBuf2).toString();
                //console.log(filePosition - lineBuf.length, lineBuf2.toString('hex'));

            }
            cache.push({ filePosition: currentFilePosition, line });
            line = null;
            lastNewLineBufferPosition = bufferPosition+1;
              
        }
        while (bufferPosition < buffer.length) {
            let bufferPositionValue = buffer[bufferPosition];
            const isCRLF1 = buffer[bufferPosition - 1] == 13 &&
                buffer[bufferPosition] == 10;
            const isCRLF2 = buffer[bufferPosition - 3] == 0 && buffer[bufferPosition - 2] == 13 &&
                buffer[bufferPosition - 1] == 0 && buffer[bufferPosition] == 10;

            if (isCRLF1 || isCRLF2) {
                pushItem(bufferPosition);

            }
            filePosition++;
            bufferPosition++;
        }
        pushItem(bufferPosition );
        return cache;
    };

    _readChunk() {
        let totalBytesRead = 0;

        let bytesRead;
        const buffers = [];
        this.readOccuredFdPosition = this.fdPosition;
        do {
            const readBuffer = Buffer.alloc(buffers.length ? 1 : this.options.readChunk);

            bytesRead = fs.readSync(this.fd, readBuffer, 0, readBuffer.length, this.fdPosition);
            totalBytesRead = totalBytesRead + bytesRead;
            this.fdPosition = this.fdPosition + bytesRead;

            buffers.push(readBuffer);
            if (readBuffer.length == 1 && readBuffer[0] == 10) {
                const prevBuffer2 = buffers[buffers.length - 2];
                if (prevBuffer2[0] == 13) {
                    buffers.pop();
                    buffers.pop();
                    break;
                }
                if (buffers.length > 4) {
                    const prevBuffer3 = buffers[buffers.length - 3];
                    const prevBuffer4 = buffers[buffers.length - 4];

                    if (prevBuffer2[0] == 0 && prevBuffer3[0] == 13 && prevBuffer4[0] == 0) {
                        buffers.pop();
                        buffers.pop();
                        buffers.pop();
                        buffers.pop();

                        break;
                    }
                }
            }
        } while (bytesRead);

        let bufferData = Buffer.concat(buffers);
        if (bytesRead == 0) {
            this.eofReached = true;
            bufferData = bufferData.slice(0, totalBytesRead);
        }

        if (totalBytesRead) {
            this.linesCache = this.computeLinesCache(bufferData);


        }

        return totalBytesRead;
    }

    next() {
        if (!this.fd) return false;

        let item = null;

        if (this.eofReached && this.linesCache.length === 0) {
            return null;
        }

        let bytesRead;

        if (!this.linesCache.length) {
            bytesRead = this._readChunk();
        }

        if (this.linesCache.length) {
            item = this.linesCache.shift();
        }

        if (this.eofReached && this.linesCache.length === 0) {
            this.close();
        }

        return item;
    }
}

