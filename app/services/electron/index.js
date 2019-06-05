"use strict";

// 设置electron window.electronIpcRenderer属性
if (window !== undefined) {
    const ipcRenderer = require("electron").ipcRenderer;
    console.log("preload ipcRenderer:", ipcRenderer);
    window.electronIpcRenderer = window.electronIpcRenderer || ipcRenderer;
}