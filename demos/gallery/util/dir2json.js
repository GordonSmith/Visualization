import fs from 'fs';
import path from 'path';

function dirTree(filename) {
    var stats = fs.lstatSync(filename);
    var info = {
        path: filename,
        name: path.basename(filename)
    };

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function (child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        info.type = "file";
    }

    return info;
}

console.log(process.argv[2]);
const info = dirTree(process.argv[2] ?? "./samples");
fs.writeFileSync(path.join((process.argv[2] ?? "./samples"), "samples.json"), JSON.stringify(info, null, 2));
