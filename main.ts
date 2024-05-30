import {
  app,
  BrowserWindow,
  Menu,
  dialog,
  OpenDialogReturnValue,
  BrowserWindowConstructorOptions,
  MenuItemConstructorOptions,
  SaveDialogReturnValue,
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function createWindow(): Promise<void> {
  const options: BrowserWindowConstructorOptions = {
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  };

  let win: BrowserWindow = new BrowserWindow(options);

  win.loadFile('index.html');

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click: () => openFile(win),
        },
        {
          label: 'Save',
          click: () => saveFile(win),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
}

async function openFile(win: BrowserWindow): Promise<void> {
  const result: OpenDialogReturnValue = await dialog.showOpenDialog(win);
  if (!result.canceled && result.filePaths.length > 0) {
    await readFile(result.filePaths[0], win);
  }
}

async function readFile(filePath: string, win: BrowserWindow): Promise<void> {
  try {
    const data: string = await readFileAsync(filePath, 'utf-8');
    await win.webContents.executeJavaScript(
      `document.querySelector('textarea').value = ${JSON.stringify(data)}`,
    );
  } catch (err) {
    dialog.showErrorBox('An error occurred reading the file', err.message);
  }
}

async function saveFile(win: BrowserWindow): Promise<void> {
  const value: string = await win.webContents.executeJavaScript(
    `document.querySelector('textarea').value`,
  );
  const result: SaveDialogReturnValue = await dialog.showSaveDialog(win);
  if (!result.canceled && result.filePath) {
    try {
      await writeFileAsync(result.filePath, value);
    } catch (err) {
      dialog.showErrorBox('An error occurred saving the file', err.message);
    }
  }
}

app.whenReady().then(createWindow);
