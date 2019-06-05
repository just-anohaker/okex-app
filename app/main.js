const { app, BrowserWindow } = require('electron');
const path = require("path");
const fs = require("fs");

// / debug config
const userDocumentsDir = app.getPath("documents");
const DEBUG_CONF_DIR = path.resolve(path.join(userDocumentsDir, ".etm_okex_datas"));
const DEBUG_REMOTE_CONF = path.join(DEBUG_CONF_DIR, "__DEBUG_REMOTE__");
const DEBUG_WEBSERVER_CONF = path.join(DEBUG_CONF_DIR, "__DEBUG_WEBSERVER__");

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win

function createWindow() {
    // 创建浏览器窗口。
    let webPreferencesConf = {
        preload: path.resolve(path.join(__dirname, "services", "electron", "index.js"))
    };
    if (fs.existsSync(DEBUG_REMOTE_CONF)) {
        webPreferencesConf = {};
    }

    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: webPreferencesConf
    });

    // 加载index.html文件
    if (fs.existsSync(DEBUG_WEBSERVER_CONF)) {
        const httpServer = fs.readFileSync(DEBUG_WEBSERVER_CONF).toString("utf-8");
        win.loadURL(httpServer);
    } else {
        // /> publish
        // win.loadFile(path.join(__dirname, "build", "index.html"));

        // /> dev
        win.loadFile(path.join(__dirname, "dev", "index.html"));
    }

    // 打开开发者工具
    win.webContents.openDevTools();

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null;
    });

    console.log("webContentsChanged emitted.");
    app.emit("webContentsChanged", win.webContents);
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
        createWindow()
    }
});

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
if (!fs.existsSync(DEBUG_REMOTE_CONF)) {
    require("./services");

    // setInterval(() => {
    //     console.log("begin ipcMain send event");
    //     if (win) {
    //         console.log("ipcMain win.webContents.send called");
    //         win.webContents.send("hello", { number: Math.round(Math.random() * 10000) });
    //     }
    //     console.log("end ipcMain send event");
    // }, 10000);
}



