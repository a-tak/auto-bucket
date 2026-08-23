#!/usr/bin/env node

const fs = require("node:fs")
const path = require("node:path")
const archiver = require("archiver")

const DEST_DIR = path.join(__dirname, "../dist")
const DEST_ZIP_DIR = path.join(__dirname, "../dist-zip")
const ARCHIVE_DATE = new Date("1980-01-01T00:00:00.000Z")

const extractExtensionData = () => {
  const extPackageJson = require("../package.json")

  return {
    name: extPackageJson.name,
    version: extPackageJson.version,
  }
}

const buildZip = (src, dist, zipFilename) => {
  console.info(`Building ${zipFilename}...`)

  const archive = archiver("zip", { zlib: { level: 9 } })
  const output = fs.createWriteStream(path.join(dist, zipFilename))

  return new Promise((resolve, reject) => {
    output.on("close", resolve)
    output.on("error", reject)
    archive.on("warning", (error) => {
      if (error.code === "ENOENT") {
        console.warn(error.message)
      } else {
        reject(error)
      }
    })
    archive.on("error", reject)
    archive.pipe(output)

    const addFiles = (directory, relativeDirectory = "") => {
      const entries = fs
        .readdirSync(directory, { withFileTypes: true })
        .sort((left, right) => left.name.localeCompare(right.name, "en"))

      for (const entry of entries) {
        if (entry.name === ".DS_Store") {
          continue
        }

        const filePath = path.join(directory, entry.name)
        const relativePath = path.join(relativeDirectory, entry.name)

        if (entry.isDirectory()) {
          addFiles(filePath, relativePath)
        } else {
          archive.append(fs.readFileSync(filePath), {
            name: relativePath.split(path.sep).join("/"),
            date: ARCHIVE_DATE,
            mode: 0o644,
          })
        }
      }
    }

    addFiles(src)
    archive.finalize()
  })
}

const main = async () => {
  const { name, version } = extractExtensionData()
  const zipFilename = `${name}-v${version}.zip`

  if (!fs.existsSync(DEST_DIR)) {
    throw new Error("dist does not exist. Run `npm run build` first.")
  }

  const builtManifest = JSON.parse(
    fs.readFileSync(path.join(DEST_DIR, "manifest.json"), "utf8")
  )
  if (builtManifest.version !== version) {
    throw new Error(
      `Version mismatch: package.json=${version}, dist/manifest.json=${builtManifest.version}`
    )
  }

  fs.mkdirSync(DEST_ZIP_DIR, { recursive: true })

  await buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename)
  console.info(`OK: ${path.join(DEST_ZIP_DIR, zipFilename)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
