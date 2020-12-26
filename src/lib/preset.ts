import { readFile } from 'fs-extra'
import { parseXmlString,Element} from 'libxmljs' 
export class Preset{
    categories:CategoryPreset[];
    /**
     *
     */
    constructor() {
        
    }
    async loadFromFile(filePath){
        const contents=await  readFile(filePath,{encoding:'utf-8'})
        const doc=parseXmlString(contents);
        this.categories =  Array.from(  doc.find('//Category')).map(
            elm=>new CategoryPreset(elm)
        ) 
    }
}
class CategoryPreset{
    attributes: { name: string;icon:string;color:string;limit:string };
    /**
     *
     */
    constructor(elm:Element ) {
        function getValue(attributeName){
            const attr=elm.attr(attributeName);
            return attr ? attr.value() : '';
        }
         this.attributes={   
             name:getValue('Name'),
             icon: getValue('Icon'),
             color: getValue('Color'),
             limit:getValue('Limit')   
         };

    }
     
    canIndex({lineIndex}){
        return true;
    }   
}

class CategoryPresetForAllData{
}
