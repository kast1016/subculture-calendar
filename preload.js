const { contextBridge } = require('electron');
const { readFile } = require('fs/promises');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  readJsonFile: async (filename) => {
    const filePath = path.join(__dirname, filename);
    const content = await readFile(filePath, { encoding: 'utf8' });
    return JSON.parse(content);
  },
});
