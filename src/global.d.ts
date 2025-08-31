export {}
// Fixes TypeScript complaints
declare global {
  interface Window {
    fileops: {
      getProjectDir: () => Promise<Electron.OpenDialogReturnValue>
      getFile: (
        extension: string,
        typeName: string,
        path = '',
      ) => Promise<Electron.OpenDialogReturnValue>
      saveFile: (
        extension: string,
        typeName: string,
        path = '',
      ) => Promise<Electron.SaveDialogReturnValue>
      fileExists: (path: string) => Promise<boolean>
      readFile: (path: string) => Promise<string>
      readBinaryFile: (path: string) => Promise<ArrayBuffer>
      writeFile: (path: string, content: string) => Promise<boolean>
      writeBinaryFile: (path: string, buffer: ArrayBuffer) => Promise<boolean>
      makeDir: (path: string) => Promise<boolean>
      extractZip: (zipPath: string, targetPath: string) => Promise<boolean>
      delete: (path: string) => Promise<boolean>
      getTempFile: (filename: string) => Promise<string>
    }
    reflection: {
      getAppVersion: () => Promise<string>
    }
    networkops: {
      fetchGithubZip: (repoPath: string) => Promise<ArrayBuffer>
      checkForUpdates: () => Promise<electronUpdater.UpdateCheckResult | null>
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
      flashFirmware: (data: { port: string; baud: string; projPath: string }) => Promise<boolean>
    }
  }
}
