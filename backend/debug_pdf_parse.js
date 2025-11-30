import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function test() {
    try {
        console.log('Creating PDFParse instance...');
        const parser = new PDFParse({});
        console.log('Instance created.');
        console.log('Instance keys:', Object.keys(parser));
        console.log('Instance prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));

        const buffer = fs.readFileSync('/tmp/test.pdf');
        console.log('Read PDF, size:', buffer.length);

        console.log('Calling load...');
        const document = await parser.load('/tmp/test.pdf');
        console.log('Document loaded.');

        console.log('Calling getText...');
        const text = await parser.getText();
        console.log('Text extracted:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
