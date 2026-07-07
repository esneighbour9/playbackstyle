"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getMediaSessions: () => electron_1.ipcRenderer.invoke('get-media-sessions'),
    mediaPlay: () => electron_1.ipcRenderer.invoke('media-play'),
    mediaPause: () => electron_1.ipcRenderer.invoke('media-pause'),
    mediaToggle: () => electron_1.ipcRenderer.invoke('media-toggle'),
    mediaNext: () => electron_1.ipcRenderer.invoke('media-next'),
    mediaPrevious: () => electron_1.ipcRenderer.invoke('media-previous'),
    minimize: () => electron_1.ipcRenderer.send('minimize'),
    maximize: () => electron_1.ipcRenderer.send('maximize'),
    close: () => electron_1.ipcRenderer.send('close'),
});
