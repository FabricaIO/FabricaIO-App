export {}

declare global {
  interface Window {
    fileops: {
      getProjectDir: () => Promise<Electron.OpenDialogReturnValue>
    }
  }
}
