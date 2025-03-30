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
    shell: {
      execCommand: (command: string, args: string[]) => Promise<boolean>
      onBuildOutput: (callback: (data: string) => void) => void
      removeAllListeners: (channel: string) => void
      getUserInfo: () => Promise<{ uid: number; gid: number; homedir: string }>
      platform: string
    }
    serial: {
      listSerialPorts: () => Promise<
        Array<{
          path: string
          manufacturer?: string
          serialNumber?: string
          pnpId?: string
          locationId?: string
          vendorId?: string
          productId?: string
        }>
      >
    }
  }
}
