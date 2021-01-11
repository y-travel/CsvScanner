import { open, read, write } from "fs-extra";

export class Indexer {
    fd: number;
    counter: number;
    filePath: string;
    /**
     *
     */
    constructor() {
        this.counter=0;
    }
    async link(  filePath: string,flags='w+') {
        this.filePath = filePath;
        this.fd = await open(filePath,flags);
    }
    indicate(value:string){
        return this.write(this.counter++,value);
    }
    write(index: number, value: number | string) {
        const CrLf = "\r\n";
        const buffer = Buffer.from(`${parseInt(value.toString(),10).toString(16).padStart(10, '0')}${CrLf}`);
        return new Promise((resolve, reject) =>
            write(this.fd, buffer, 0, buffer.length, index * buffer.length,
                (err, n) => err ? reject(err) : resolve(n)));
    }
    read(index:number):Promise<number>{    
        const buffer=Buffer.alloc(12);
        return new Promise((resolve, reject) =>
            read(this.fd, buffer, 0, buffer.length,
                 index * buffer.length,
                (err, n) =>{
                    if(n==0) return resolve(-1);
                    return err ? reject(err) : resolve( parseInt(  buffer.toString().trim(),16)  )  
                } ));

    }

}