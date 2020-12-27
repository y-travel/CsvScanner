import { readFile } from 'fs-extra'
import { parseXmlString,Element} from 'libxmljs' 
export class Preset{
    processRow(item: any):CategoryPreset[] {
    return this.categories.filter( cat=>cat.checkItem(item));
    }
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
        ); 
        this.categories.unshift(new CategoryPresetForAllData());
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
        if(!elm) return;
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
    public checkItem(item){

    }   
}

class CategoryPresetForAllData extends CategoryPreset {
    /**
     *
     */
    constructor() {
        super(null);

    }
    public checkItem(item){
        return true;
    }
}
