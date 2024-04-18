# Grogu.js (light weight express boilerplate)

## Usage Documentation

Click [here](./docs/index.md) for usage documentation

## How to run the app

The entry point of the project is `app.js`

### For Running in Dev

```sh
npm run dev # This will run the project in development environment
```

For running the above command `.env.dev` file should exist inside the folder root.

### For Running in Prod

```sh
npm run start # This will run the project in prod environment
```

For running the above command `.env` file should exist inside the folder root.

## Dependencies
### node-poppler
```sh
npm i node-poppler
```
This package is used to convert pdf into image.
This package required to install following dependancies

```sh
sudo apt-get install poppler-data
sudo apt-get install poppler-utils
```
Once they have been installed, you will need to pass the poppler-utils installation directory as a parameter to an instance of the Poppler class:

```js
const pdfToImgConverter = new Poppler("/usr/bin");
```
