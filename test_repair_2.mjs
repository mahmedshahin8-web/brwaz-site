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

console.log(jsonrepair(str));
