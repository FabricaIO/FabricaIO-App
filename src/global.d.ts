export {}

declare global {
  interface Window {
    fileops: {
      getProjectDir: () => Promise<Electron.OpenDialogReturnValue>
    }
    myWindowAPI: {
      minimize: () => Promise<void>
      toggleMaximize: () => Promise<void>
      close: () => Promise<void>
    }
  }
}
