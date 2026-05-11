const { app, BrowserWindow, shell, Tray, Menu, nativeImage, dialog } = require("electron");
const path = require("path");
const os = require("os");

app.setName("DeskGPT");

let win;
let tray;
let isQuitting = false;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", () => {
        if (win) {
            if (!win.isVisible()) win.show();
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });
}

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 850,
        title: "DeskGPT",
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    win.loadURL("https://chatgpt.com");

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    // Close button hides to tray instead of quitting
    win.on("close", (event) => {
        if (!isQuitting) {
            event.preventDefault();
            win.hide();
        }
    });
}

function createTray() {
    const iconPath = path.join(
        os.homedir(),
                               ".local/share/icons/hicolor/512x512/apps/deskgpt.png"
    );

    const trayIcon = nativeImage.createFromPath(iconPath).resize({
        width: 22,
        height: 22
    });

    tray = new Tray(trayIcon);
    tray.setToolTip("DeskGPT");

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show DeskGPT",
            click: () => {
                win.show();
                win.focus();
            }
        },
        {
            label: "Hide DeskGPT",
            click: () => {
                win.hide();
            }
        },
        { type: "separator" },
        {
            label: "About DeskGPT",
            click: () => {
                dialog.showMessageBox(win, {
                    type: "info",
                    title: "About DeskGPT",
                    message: "DeskGPT",
                    detail:
                    "Version 1.0.0\n\n" +
                    "Unofficial Linux desktop wrapper for ChatGPT.\n\n" +
                    "Created by Jared.",
                    buttons: ["OK"]
                });
            }
        },
        { type: "separator" },
        {
            label: "Quit",
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);
    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
            win.focus();
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on("window-all-closed", () => {
    // Do nothing so the tray app stays alive
});
