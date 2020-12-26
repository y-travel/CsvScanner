import { globFiles } from "./utils";
import { readFile, createReadStream ,existsSync} from 'fs-extra';
import { check } from 'xmlchecker';
import * as  readline from 'readline';
import { Preset } from "./preset";
import * as path from 'path';
async function displayFileLineByLine(filePath, err) {
    const lineIndex = err.line - 1;

    const fileStream = createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    let index = 0;
    rl.on('line', (line) => {
        if (Math.abs(index - lineIndex) < 3) {
            const sp = ' ';
            console.log(`${((index + 1) + '').padStart(5)}|${line}`);
            if (lineIndex == index) {
                console.log(`${sp.padStart(5)} ${sp.repeat(err.column)}^`);
                console.log(`${sp.padStart(5)} ` + err.message);

            }
        }
        index++;
    });

}
export async function checkXmlFile(filePath: string) {
    try {
        if(!existsSync(filePath)) 
            throw new Error( `${filePath} not found`);
        const contents = await readFile(filePath, { encoding: 'utf-8' });
        check(contents);
       
return true;
    } catch (err) {
        console.log(`Error ${path.resolve(  filePath)} : ` + err.name + " at " + err.line + "," + err.column);

        if (typeof err.line == 'number' && typeof err.column == 'number') {
            await displayFileLineByLine(filePath, err);
        }
         
    }
}
export async function checkXmlFiles(dirs = "./data/*.xml") {
    const files = await globFiles(dirs);
    for (const filePath of files) {

        await checkXmlFile(filePath)

    }


}
 