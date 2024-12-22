import data from '../src/data.json' assert { type: 'json' };
import { readdir, copyFile } from 'node:fs/promises';
import { glob } from 'glob';

// const images = await readdir('./scripts/export', {withFileTypes: true, recursive: true});

const icons = Object.entries(data.items).map(([key, item]) => item.icon);

let images = await glob('./scripts/export/**/*.png');

images.forEach(image => {
    const matches = image.match(/(IconDesc_.*)_(.*).png/);

    if(icons.includes(matches[1])) {
        copyFile(image, `./public/img/icons/${matches[0]}`);
    }
});

console.log(images);