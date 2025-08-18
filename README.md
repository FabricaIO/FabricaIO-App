# Fabrica-IO App

This app is used to setup and configure you Fabrica-IO project. For details on installing and using app, please refer to the [wiki](https://github.com/FabricaIO/FabricaIO-App/wiki/App-Usage).

## Installation

Follow the [setup instructions](https://github.com/FabricaIO/FabricaIO-App/wiki/App-Usage#setup) here to install the app. If you'd like to contribute as a developer, or build from source, see the instructions below.

## Developers

### Toolchain Setup

1. Download or clone this repository.
2. Install `Node` with `npm` using [these instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/), `nvm` is recommended to install the other items. `Yarn` can also be used, but that isn't covered here.
3. Install the global Quasar CLI following [these instructions](https://quasar.dev/start/quick-start#optional-install-the-global-cli)
4. Open either Visual Studio Code or a terminal/command prompt in the same directory as the downloaded/cloned repository.
5. Enter the below commands in order:

### Install the dependencies

```bash
npm install
```

### Start the app in development mode or build the app for usage (this must be built in Eelectron mode)

```bash
quasar dev -m electron
# or
quasar build -m electron
```
