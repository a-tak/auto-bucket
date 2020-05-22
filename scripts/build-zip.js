#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const archiver = require("archiver")

const DEST_DIR = path.join(__dirname, "../dist")
const DEST_ZIP_DIR = path.join(__dirname, "../dist-zip")

const extractExtensionData = () => {
  const extPackageJson = require("../package.json")

  return {
    name: extPackageJson.name,
    version: extPackageJson.version,
  }
}

const makeDestZipDirIfNotExists = () => {
  if (!fs.existsSync(DEST_ZIP_DIR)) {
    fs.mkdirSync(DEST_ZIP_DIR)
  }
}

const buildZip = (src, dist, zipFilename) => {
  console.info(`Building ${zipFilename}...`)

  const archive = archiver("zip", { zlib: { level: 9 } })
  const stream = fs.createWriteStream(path.join(dist, zipFilename))

  return new Promise((resolve, reject) => {
    archive
      .directory(src, false)
      .on("error", (err) => reject(err))
      .pipe(stream)

    stream.on("close", () => resolve())
    archive.finalize()
  })
}

const execludeFile = (dirpath) => {
  fs.readdir(dirpath, { withFileTypes: true }, (err, dirents) => {
    if (err) {
      console.error(err)
      return
    }

    for (const dirent of dirents) {
      const fp = path.join(dirpath, dirent.name)
      if (dirent.isDirectory()) {
        execludeFile(fp)
      } else {
        switch (path.basename(fp)) {
          case ".DS_Store":
            fs.unlinkSync(fp)
            break
        }
      }
    }
  })
}

const main = () => {
  const { name, version } = extractExtensionData()
  const zipFilename = `${name}-v${version}.zip`

  execludeFile(DEST_DIR)

  makeDestZipDirIfNotExists()

  buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename)
    .then(() => console.info("OK"))
    .catch(console.err)
}

main()
