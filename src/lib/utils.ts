import * as glob0 from 'glob';
import {promisify} from 'util';
const glob=promisify(glob0);
export function globFiles(dirs:string|string[]) {  
    dirs= dirs instanceof Array ? dirs : [dirs];
    return Promise.all(dirs.map(dir=>glob(dir)) ).then((results:Array<string[]>)=>
       [''].concat(...results).filter(Boolean)
        ) ;
}