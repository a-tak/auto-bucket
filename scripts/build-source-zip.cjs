#!/usr/bin/env node

const { execFileSync } = require("node:child_process")
const fs = require("node:fs")
const path = require("node:path")
const archiver = require("archiver")

const PROJECT_ROOT = path.resolve(__dirname, "..")
const DEST_DIR = path.join(PROJECT_ROOT, "dist-zip")
const LFS_POINTER_HEADER = "version https://git-lfs.github.com/spec/v1"
const ARCHIVE_DATE = new Date("1980-01-01T00:00:00.000Z")

const packageJson = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8")
)
const archiveName = `${packageJson.name}-v${packageJson.version}-source.zip`
const archivePrefix = `${packageJson.name}-v${packageJson.version}-source`

const getTrackedFiles = () =>
  execFileSync("git", ["ls-files", "-z"], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)

const isLfsPointer = (filePath) => {
  const descriptor = fs.openSync(filePath, "r")
  const header = Buffer.alloc(128)

  try {
    const bytesRead = fs.readSync(descriptor, header, 0, header.length, 0)
    return header
      .subarray(0, bytesRead)
      .toString("utf8")
      .startsWith(LFS_POINTER_HEADER)
  } finally {
    fs.closeSync(descriptor)
  }
}

const buildArchive = (files) => {
  const archivePath = path.join(DEST_DIR, archiveName)
  const output = fs.createWriteStream(archivePath)
  const archive = archiver("zip", { zlib: { level: 9 } })

  return new Promise((resolve, reject) => {
    output.on("close", () => resolve(archivePath))
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

    for (const relativePath of files) {
      archive.append(
        fs.createReadStream(path.join(PROJECT_ROOT, relativePath)),
        {
          name: `${archivePrefix}/${relativePath}`,
          date: ARCHIVE_DATE,
          mode: 0o644,
        }
      )
    }

    archive.finalize()
  })
}

const main = async () => {
  const files = getTrackedFiles()
  const missingFiles = files.filter(
    (relativePath) => !fs.existsSync(path.join(PROJECT_ROOT, relativePath))
  )

  if (missingFiles.length > 0) {
    throw new Error(`Tracked files are missing:\n${missingFiles.join("\n")}`)
  }

  const pointerFiles = files.filter((relativePath) =>
    isLfsPointer(path.join(PROJECT_ROOT, relativePath))
  )
  if (pointerFiles.length > 0) {
    throw new Error(
      `Git LFS files have not been downloaded:\n${pointerFiles.join(
        "\n"
      )}\nRun \`git lfs pull\` first.`
    )
  }

  fs.mkdirSync(DEST_DIR, { recursive: true })
  const archivePath = await buildArchive(files)
  console.info(`OK: ${archivePath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
