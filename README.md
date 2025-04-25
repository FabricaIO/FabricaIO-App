# Fabrica-IO App
This app is used to setup and configure you Fabrica-IO project. For details on the useage of this app, please refer to the [wiki](https://github.com/FabricaIO/FabricaIO-App/wiki/App-Usage).

The below guide will go through how to setup the toolchain and build/run the app.

## Toolchain Setup
1. Download or clone this repository.
2. Install `Node` with `npm` using [these instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/), `nvm` is recommended to install the other items. `Yarn` can also be used, but that isn't covered here.
3. Install the global Quasar CLI following [these instructions](https://quasar.dev/start/quick-start#optional-install-the-global-cli)
4. Open either Visual Studio Code or a terminal/command prompt in the same directory as the downloaded/cloned repository.
5. Enter the below commands in order:

### Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode or build the app for usage (this must be built in Eelectron mode)
```bash
quasar dev -m electron
# or
quasar build -m electron
```
