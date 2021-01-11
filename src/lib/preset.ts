import { readFile } from 'fs-extra'
import * as validators from './validators';
import { parseXmlString, Element } from 'libxmljs'
export class Preset {
    filePath: any;
    processRow(item: any): CategoryPreset[] {
        return this.categories.filter(cat => cat.checkItem(item));
    }
    categories: CategoryPreset[];
    /**
     *
     */
    constructor() {

    }
    async loadFromFile(filePath) {
        const contents = await readFile(filePath, { encoding: 'utf-8' });
        this.filePath = filePath;
        try {
            const doc = parseXmlString(contents);
            this.categories = Array.from(doc.find('//Category')).map(
                elm => new CategoryPreset(elm)
            );
            this.categories.unshift(new CategoryPresetForAllData());
        } catch (exc) {
            throw exc;
        }
    }
}
class CategoryPreset {
    attributes: { name: string; icon: string; color: string; limit:number };
    rules: Array<{func:Function,functionName:string,argv:any,sourceField:string}>;
    /**
     *
     */
    constructor(elm: Element) {
        function getValue(attributeName):any {
            const attr = elm.attr(attributeName);
            return attr ? attr.value() : '';
        }
        if (!elm) return;
        this.attributes = {
            name: getValue('Name'),
            icon: getValue('Icon'),
            color: getValue('Color'),
            limit: getValue('Limit')  
        };
        this.attributes.limit=this.attributes.limit ? parseInt(this.attributes.limit as any): undefined;
        this.rules =   elm.childNodes().map((ruleElm:Element) =>{
            if(ruleElm.name()!='Rule') return ;
            const result :CategoryPreset['rules'][0] = Object.fromEntries(ruleElm.attrs().map(attr=>[ 
                camelCase(attr.name()),attr.value()])) as any;
            const func:Function= validators[result.functionName];
            if(!(func instanceof Function)){
                return; // TODO : ERROR
            }
            if(   func['numberInput'] && typeof result.argv=='string'){
                result.argv=parseInt(result.argv.replace(/[_,]/ig,'')); 
            }
            result.func=func;
            
            return result;
        }).filter(Boolean);
    }

    canIndex({ lineIndex }) {
        return true;
    }
    public checkItem(item) {
        let score=0;
        for(const rule of this.rules){
            const cellValue=item[rule.sourceField];
            if((cellValue ===undefined)){
                continue ; //error
            }
            if(!rule.func(cellValue,rule.argv))  return false;
            score++;     
        }  
        return score>0; 
    }
}
function camelCase(s:string){
    return s[0].toLocaleLowerCase()+s.substr(1);
}
class CategoryPresetForAllData extends CategoryPreset {
    /**
     *
     */
    constructor() {
        super(null);
        this.attributes = { name: 'AllData' } as any;

    }
    public checkItem(item) {
        return true; 
    }
    canIndex({ lineIndex }) {
        return lineIndex % 100 == 0;
    }
}
