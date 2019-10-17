"use strict";

const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const { app } = require("electron");
const terminate = require("terminate");
const { ipcMain, dialog } = require("electron");
// const { Application } = require("okrobot-electron");

let _mainWindow;

function getCurrentDateTime() {
    const t = new Date();

    const y = t.getFullYear().toString();
    const m = (t.getMonth() + 1).toString().padStart(2, "0");
    const d = t.getDate().toString().padStart(2, "0");
    const H = t.getHours().toString().padStart(2, "0");
    const M = t.getMinutes().toString().padStart(2, "0");
    const S = t.getSeconds().toString().padStart(2, "0");
    const MS = t.getMilliseconds().toString().padStart(3, "0");

    return `${y}${m}${d}_${H}${M}${S}_${MS}`;
}

function initSystemLogger(inst) {
    const logsDir = path.resolve(path.join(inst.cwd(), "logs"));
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    const currentDateTime = getCurrentDateTime();
    const outFilePath = path.join(logsDir, `${currentDateTime}-out.log`);
    const errorFilePath = path.join(logsDir, `${currentDateTime}-error.log`);

    const nodeConsoleLog = console.log.bind(console);

    const outStream = fs.createWriteStream(outFilePath);
    const errorStream = fs.createWriteStream(errorFilePath);
    inst.console = new console.Console(outStream, errorStream);

    console.log = function (message, ...optionalParams) {
        nodeConsoleLog(message, ...optionalParams);
        inst.console.log(message, ...optionalParams);
    }
}

function nativeUtils() {
    function openFileDialog(evt) {
        dialog.showOpenDialog(
            _mainWindow,
            {
                title: "预警音乐文件选择",
                properties: ["openFile"],
                filters: [
                    { name: "预警音乐", extensions: ["mp3", "wav", "ogg", "flac"] }
                ]
            },
            (filePaths) => {
                if (filePaths === undefined || filePaths.length <= 0) {
                    return evt.sender.send(
                        "utils.openFileDialog",
                        {
                            success: true,
                            result: {
                                canceled: true
                            }
                        }
                    )
                }

                return evt.sender.send(
                    "utils.openFileDialog",
                    {
                        success: true,
                        result: {
                            canceled: false,
                            filepath: filePaths[0]
                        }
                    }
                )
            }
        )
    }

    function retrieveFileData(evt, args) {
        const filepath = args.filepath;
        if (!fs.existsSync(filepath)) {
            return evt.sender.send(
                "utils.retrieveFileData",
                {
                    success: false,
                    error: "file(" + filepath + ") not exists"
                }
            );
        }

        try {
            const fileData = fs.readFileSync(filepath);
            return evt.sender.send(
                "utils.retrieveFileData",
                {
                    success: true,
                    result: {
                        data: fileData
                    }
                }
            )
        } catch (error) {
            return evt.sender.send(
                "utils.retrieveFileData",
                {
                    success: false,
                    error: error.toString()
                }
            );
        }
    }

    ipcMain.on("utils.openFileDialog", openFileDialog);
    ipcMain.on("utils.retrieveFileData", retrieveFileData);
}

function appExceptionHandler() {
    process.on("uncaughtException", (error) => {
        console.log("[uncaughtException] ", error);
    });
    process.on("rejectionHandled", promise => {
        console.log("[rejectionHandled] happended");
    });
    process.on("unhandledRejection", (reason, promise) => {
        console.log("[unhandledRejection] reason:", reason);
    });
}

function main() {
    console.log(
        `platform(${process.platform}), ` +
        `execPath(${process.execPath}), ` +
        `cwd(${process.cwd()}), ` +
        `argv(${JSON.stringify(process.argv)})`
    );
    // const inst = Application.getInstance();
    // initSystemLogger(inst);
    initSystemLogger({
        cwd: function () {
            const ownDirName = "biki_userdatas";
            const destDir = path.resolve(path.join(app.getPath("documents"), ownDirName));
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir);
            }
            return destDir;
        }
    });

    app.on("mainWindowReady", (mainWinow) => {
        _mainWindow = mainWinow;
    });

    app.on("okexAppReady", (newWebContents) => {
        console.log("okexApp started.");
        // inst.changeWebContents(newWebContents);

        initSupported();
    });

    app.on("okexAppClosed", () => {
        console.log("okexApp closed");
        // inst.changeWebContents(null);

        uninitSupported();
    });

    nativeUtils();

    appExceptionHandler();
}

main();

let childProcesses = [];

function initSupported() {
    _initBikiPythonServer();
}

function uninitSupported() {
    childProcesses.forEach(childProcess => {
        terminate(childProcess.pid);
    });
    childProcesses = [];
}

/// private 
function _initBikiPythonServer() {
    const p = [__dirname, ".."];
    if (app.isPackaged) {
        p.push("..");
        p.push("app.asar.unpacked")
    }
    p.push(...["supported", "biki_server"]);
    if (process.platform === "win32") {
        p.push(...["win32", "server", "server.exe"]);
    } else {
        p.push(...["mac", "server", "server"]);
    }
    const bikiSvrExecablePath = path.resolve(path.join(...p));
    const bikiSvrChildProcess = child_process.spawn(bikiSvrExecablePath);
    if (bikiSvrChildProcess) {
        childProcesses.push(bikiSvrChildProcess);

        bikiSvrChildProcess.stdout.on("data",
            data => console.log("bikisvr stdout data:", data.toString("utf8")));
        bikiSvrChildProcess.stdout.on("error",
            error => console.log("bikisvr stdout error:", error.toString()));
        bikiSvrChildProcess.stderr.on("data",
            data => console.log("bikisvr stderr data:", data.toString("utf8")));
        bikiSvrChildProcess.stderr.on("error",
            error => console.log("bikisvr stderr error:", error.toString()));

        bikiSvrChildProcess.on("close",
            (code, signal) => console.log(["bikisvr closed with ", code, ", ", signal].join("")));
        bikiSvrChildProcess.on("exit",
            (code, signal) => console.log(["bikisvr exit with ", code, ",", signal].join("")));
        bikiSvrChildProcess.on("error",
            error => console.log("bikisvr error:", error));
    } else {
        console.log("child_process spawn failured.");
    }
}