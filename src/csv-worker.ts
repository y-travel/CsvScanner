import {isMainThread, workerData,parentPort} from 'worker_threads';
import { detectFileEncoding  } from './lib/text-encoding';
export interface IWorkerData{
    filePath:string;
    fileEncoding?:string;
}
async function doProcess(workerData: IWorkerData){
    const {filePath}=workerData as IWorkerData;
    const fileEncoding=workerData.fileEncoding || await detectFileEncoding(filePath);

}
 if(!isMainThread){
     // worker thread mode
     doProcess(workerData)

 }