import { jsonrepair } from 'jsonrepair';

const str = `{
  "scenes": [
    {
      "scene_id": "[Scene 01]",
      "visual_concept": "A
new
line"
    }
  ]
}`;

const sanitizeJSONString = (text) => {
    let cleaned = text;
    cleaned = cleaned.replace(/[\u0000-\u001F]+/g, (match) => {
        let res = '';
        for (let i=0; i<match.length; i++) {
           let c = match[i];
           if (c === '\n') res += '\\n';
           else if (c === '\t') res += '\\t';
           else if (c === '\r') res += '\\r';
        }
        return res;
    });
    return cleaned;
};

const c = sanitizeJSONString(str);
console.log(jsonrepair(c));
