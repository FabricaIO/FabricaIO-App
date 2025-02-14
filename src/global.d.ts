export {}

declare global {
  interface Window {
    fileops: {
      getProjectDir: () => Promise<Electron.OpenDialogReturnValue>
      fileExists: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<boolean>
      readFile: (path: string) => Promise<string>
    }
    myWindowAPI: {
      minimize: () => Promise<void>
      toggleMaximize: () => Promise<void>
      close: () => Promise<void>
    }
  }
}
