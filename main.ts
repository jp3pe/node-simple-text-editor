import { app, BrowserWindow, Menu, dialog, OpenDialogReturnValue, BrowserWindowConstructorOptions, MenuItemConstructorOptions } from 'electron'
import * as path from 'path';
import * as fs from 'fs'

function createWindow (): void {
  const options: BrowserWindowConstructorOptions = {
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  }

  let win: BrowserWindow = new BrowserWindow(options)

  win.loadFile('index.html')

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click: () => openFile(win)
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)

  Menu.setApplicationMenu(menu)
}

function openFile(win: BrowserWindow): void {
  dialog.showOpenDialog(win).then((result: OpenDialogReturnValue) => {
    if (!result.canceled && result.filePaths.length > 0) {
      readFile(result.filePaths[0], win)
    }
  })
}

function readFile(filePath: string, win: BrowserWindow): void {
  fs.readFile(filePath, 'utf-8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      dialog.showErrorBox('An error occurred reading the file', err.message)
      return
    }
    win.webContents.executeJavaScript(`document.querySelector('textarea').value = ${JSON.stringify(data)}`)
  })
}

app.whenReady().then(createWindow)