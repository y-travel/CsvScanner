import { createReadStream, openSync } from "fs";
import * as iconv from 'iconv-lite';
import * as nexline from 'nexline';
import utf8BufferSize from 'utf8-buffer-size';
/**
 * TextEncoding is multi-text-encoding support but it can inherit for better performance
 */
export class TextEncoding {
    constructor(public bufferEncoding: string) {
    }
    openLineScanner(source) {
        const input = typeof source == 'string' ? openSync(source, 'r') : source;
        return nexline({
            input,
            autoCloseFile: true,
            encoding: this.bufferEncoding,
            lineSeparator:"\n"
        });
    }
     
    computeStringSize(str) { return iconv.encode(str, this.bufferEncoding).length; }
    getNewLineSize(mode = "\n") {
        return this.computeStringSize(mode);
    }

}

export class UTF8 extends TextEncoding {
    constructor() {
        super('utf-8');
    }
    computeStringSize(str: string) {
        return utf8BufferSize(str);
    }
}

export class UTF16LE extends TextEncoding {
    constructor(bufferEncoding: string = 'utf16le') {
        super(bufferEncoding);
    }
    computeStringSize(str: string) {
        return str.length * 2;
    }
}
export class UTF16BE extends UTF16LE {
    constructor() {
        super('utf16be');
    }
}
export class UTF32LE extends TextEncoding {
    constructor(bufferEncoding = 'utf32le') {
        super(bufferEncoding);
    }
    computeStringSize(str: string) {
        return str.length * 4;
    }
}
export class UTF32BE extends UTF32LE {
    constructor() {
        super('utf32be');
    }
}
class SingleByteTextEncoding extends TextEncoding {
    computeStringSize(s) { return s.length } // absolutely,single byte TextEncoding
}

export class CodePage1256 extends SingleByteTextEncoding {
    constructor() {
        super('cp1256');
    }
}

const supportedTextEncodings = {
    'utf8': UTF8,
    'utf16le': UTF16LE, 'utf16be': UTF16BE,
    'utf32le': UTF32LE, 'utf32be': UTF32BE,
    'cp1256': CodePage1256,
};
export default function getTextEncoding(encoding?: string) {
    const originalEncoding = encoding;
    encoding = encoding.toLowerCase();
    encoding = encoding.replace(/-/g, "");
    const textEncodingClass = supportedTextEncodings[encoding];
    if (textEncodingClass) return new textEncodingClass();
    if (/1256/.test(encoding))
        return new CodePage1256();
    if (/ucs2/.test(encoding) || /utf16/.test(encoding))
        return new UTF16LE(originalEncoding as any);
    if (encoding == "utf8")
        return new UTF8();
    throw new Error(`${originalEncoding} not supported`);
}
function computeLineScore(line: string) {
    let score = 0;
    if (!line || typeof line != 'string') return -1;
    for (let i = 0, len = line.length; i < len; i++) {
        let codePoint = line.codePointAt(i);
        if(codePoint==13 || codePoint==8) continue;
        if (codePoint >= 32 && codePoint < 120) score++;
        else if (codePoint > 1600 && codePoint < 1700)  score += 3
        else score -= 3
    }
    return score;
}
const computeScoreByTextEnc=async (filePath,[enc, TextEncoding]) => {
    const textEncoding = new TextEncoding();
    const fileStream = createReadStream(filePath, { start: 0, end: 64 * 1024 });
    const rl = textEncoding.openLineScanner(fileStream);
    let lineCounter = 0;
    let totalScore = 0;
    try {
        for await (const line of rl) {
            if (lineCounter++ > 10) break;
            totalScore += computeLineScore(line);
        }
        return {enc, totalScore};
    }
    catch(exc){
        console.log({exc});
    }
    finally {
        rl.close();
        fileStream.close();
    }
};
export async function detectFileEncoding(filePath) {
    let highestScorePair={enc:null,totalScore:0};
    for(const pair of Object.entries(  supportedTextEncodings)){
        const result=await computeScoreByTextEnc(filePath,pair);
        if( result.totalScore > highestScorePair.totalScore )
        highestScorePair=result;   
    }
    return highestScorePair.enc as string;
    /*
    const fileScoreByTextEnc = await Promise.all(
        Object.entries(supportedTextEncodings).map(pair=> computeScoreByTextEnc(filePath,pair)));
      
    const highestScorePair= fileScoreByTextEnc.reduce((accum, item) => item.totalScore > accum.totalScore ? item : accum, {enc:null,totalScore:0});
    return highestScorePair.enc;  */
}