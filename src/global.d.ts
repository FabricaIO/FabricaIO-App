export {}
// Fixes TypeScript complaints
declare global {
  interface Window {
    fileops: {
      getProjectDir: () => Promise<Electron.OpenDialogReturnValue>
      fileExists: (path: string) => Promise<string>
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<boolean>
      makeDir: (path: string) => Promise<boolean>
    }
    myWindowAPI: {
      minimize: () => Promise<void>
      toggleMaximize: () => Promise<void>
      close: () => Promise<void>
      openExternal: (url: string) => Promise<void>
    }
  }
}
