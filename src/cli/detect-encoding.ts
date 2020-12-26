import { detectFileEncoding } from '../lib/text-encoding';
import * as path from 'path'
export interface IArgv{
    filePath:string;
}
export default async   function   handler(argv:IArgv) {
    console.log(await detectFileEncoding(path.normalize(argv.filePath)));
}  
