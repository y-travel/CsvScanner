import { open, read, write } from "fs-extra";

export class Indexer {
    fd: number;
    /**
     *
     */
    constructor() {

    }
    async link(filePath: string) {
        this.fd = await open(filePath, 'w+');
    }
    write(index: number, value: number | string) {
        const CrLf = "\r\n";
        const buffer = Buffer.from(`${parseInt(value.toString(),10).toString(16).padStart(10, '0')}${CrLf}`);
        return new Promise((resolve, reject) =>
            write(this.fd, buffer, 0, buffer.length, index * buffer.length,
                (err, n) => err ? reject(err) : resolve(n)));
    }
    read(index:number){    
        const buffer=Buffer.alloc(12);
        return new Promise((resolve, reject) =>
            read(this.fd, buffer, 0, buffer.length,
                 index * buffer.length,
                (err, n) => err ? reject(err) : resolve( parseInt(  buffer.toString().trim(),16)  )));

    }

}