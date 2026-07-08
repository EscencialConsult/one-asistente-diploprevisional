const fs = require('fs');

const path = 'C:\\\\Users\\\\PERSONAL\\\\.gemini\\\\antigravity-ide\\\\brain\\\\36929750-db33-48b9-bb15-681b0f806ef8\\\\.system_generated\\\\logs\\\\transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

let extracted = [];
for (let line of lines) {
    if (line.includes('replace_file_content')) {
        extracted.push(line);
    }
}

fs.writeFileSync('C:\\\\Users\\\\PERSONAL\\\\Documents\\\\PROYECTOS\\\\PRODUCTOS\\\\EXLUSIVO DE CAPCACITACIONES\\\\DIPLO PREVISIONAL\\\\CHAT DE ASISTENCIA\\\\extracted_tools.json', JSON.stringify(extracted, null, 2));
console.log('Done extracting ' + extracted.length + ' lines.');
