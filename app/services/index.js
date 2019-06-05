"use strict";

const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { Application } = require("okrobot-electron");

function getCurrentDateTime() {
    const t = new Date();

    return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}_${t.getHours()}_${t.getMinutes()}_${t.getSeconds()}_${t.getMilliseconds()}`;
}

function initSystemLogger(inst) {
    const logsDir = path.resolve(path.join(inst.cwd(), "logs"));
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    const currentDateTime = getCurrentDateTime();
    const outFilePath = path.join(logsDir, `log-${currentDateTime}.log`);
    const errorFilePath = path.join(logsDir, `error-${currentDateTime}.log`);

    const nodeConsoleLog = console.log.bind(console);

    const outStream = fs.createWriteStream(outFilePath);
    const errorStream = fs.createWriteStream(errorFilePath);
    inst.console = new console.Console(outStream, errorStream);

    console.log = function (message, ...optionalParams) {
        nodeConsoleLog(message, ...optionalParams);
        inst.console.log(message, ...optionalParams);
    }
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
    const inst = Application.getInstance();
    initSystemLogger(inst);

    app.on("webContentsChanged", (newWebContents) => {
        console.log("webContentChanged");
        inst.changeWebContents(newWebContents);
    });

    appExceptionHandler();
}

main();