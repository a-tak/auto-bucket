#!/usr/bin/env node

const fs = require("node:fs")
const path = require("node:path")

const PROJECT_ROOT = path.resolve(__dirname, "..")
const CHECK_DIST = process.argv.includes("--check-dist")

const readJson = (relativePath) => {
  const filePath = path.join(PROJECT_ROOT, relativePath)

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"))
  } catch (error) {
    throw new Error(`Unable to read ${relativePath}: ${error.message}`)
  }
}

const readText = (relativePath) => {
  const filePath = path.join(PROJECT_ROOT, relativePath)

  try {
    return fs.readFileSync(filePath, "utf8")
  } catch (error) {
    throw new Error(`Unable to read ${relativePath}: ${error.message}`)
  }
}

const packageJson = readJson("package.json")
const packageLock = readJson("package-lock.json")
const manifest = readJson("src/manifest.json")
const failures = []
const version = packageJson.version

if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) {
  failures.push(
    `package.json release version must use X.Y.Z format: ${version}`
  )
}

if (manifest.version !== version) {
  failures.push(
    `Version mismatch: package.json=${version}, src/manifest.json=${manifest.version}`
  )
}

const lockVersion = packageLock.packages?.[""]?.version
if (lockVersion !== version) {
  failures.push(
    `Version mismatch: package.json=${version}, package-lock.json=${
      lockVersion ?? "missing"
    }`
  )
}

const releaseTag = process.env.RELEASE_TAG?.trim()
if (releaseTag && releaseTag !== `v${version}`) {
  failures.push(
    `Release tag mismatch: expected v${version}, received ${releaseTag}`
  )
}

if (CHECK_DIST) {
  const builtManifest = readJson("dist/manifest.json")
  if (builtManifest.version !== version) {
    failures.push(
      `Version mismatch: package.json=${version}, dist/manifest.json=${builtManifest.version}`
    )
  }

  const projectLicense = readText("dist/LICENSE")
  if (!projectLicense.startsWith("MIT License")) {
    failures.push("dist/LICENSE does not contain the AutoBucket MIT license")
  }
  if (
    !projectLicense.includes("TinySegmenter 0.1") ||
    !projectLicense.includes("new BSD licence")
  ) {
    failures.push("dist/LICENSE does not preserve the TinySegmenter BSD notice")
  }

  const thirdPartyNotices = readText("dist/THIRD_PARTY_NOTICES.txt")
  const requiredNoticeText = [
    `webextension-polyfill@${
      packageLock.packages?.["node_modules/webextension-polyfill"]?.version ??
      "missing"
    }`,
    "Mozilla Public License Version 2.0",
    `tiny-segmenter@${
      packageLock.packages?.["node_modules/tiny-segmenter"]?.version ??
      "missing"
    }`,
    "original TinySegmenter 0.1 BSD notice",
    "html-parse-stringify@3.0.1",
    "does not include a standalone license file",
    packageLock.packages?.["node_modules/webextension-polyfill"]?.integrity ??
      "missing webextension-polyfill integrity",
  ]

  for (const requiredText of requiredNoticeText) {
    if (!thirdPartyNotices.includes(requiredText)) {
      failures.push(`dist/THIRD_PARTY_NOTICES.txt is missing: ${requiredText}`)
    }
  }
}

if (failures.length > 0) {
  console.error("Release validation failed:")
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.info(
  `Release metadata OK: version=${version}${
    releaseTag ? `, tag=${releaseTag}` : ""
  }`
)

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`)
}
