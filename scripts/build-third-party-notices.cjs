#!/usr/bin/env node

const fs = require("node:fs")
const path = require("node:path")

const PROJECT_ROOT = path.resolve(__dirname, "..")
const DIST_DIR = path.join(PROJECT_ROOT, "dist")
const PACKAGE_LOCK_PATH = path.join(PROJECT_ROOT, "package-lock.json")
const LICENSE_FILE_PATTERN = /^(licen[sc]e|copying|notice)(\..*|-.*)?$/i
const ALLOWED_MISSING_LICENSE_FILES = new Set(["html-parse-stringify@3.0.1"])

const MIT_TERMS = `Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"))

const normalizeText = (text) => text.replace(/\r\n/g, "\n").trim()

const formatAuthor = (author) => {
  if (typeof author === "string") {
    return author
  }

  if (author && typeof author === "object") {
    const email = author.email ? ` <${author.email}>` : ""
    return `${author.name ?? "Unknown author"}${email}`
  }

  return "the package authors"
}

const formatRepository = (repository) => {
  if (typeof repository === "string") {
    return repository
  }

  return repository?.url ?? ""
}

const buildFallbackLicense = (packageJson, declaredLicense) => {
  const packageIdentifier = `${packageJson.name}@${packageJson.version}`

  if (!ALLOWED_MISSING_LICENSE_FILES.has(packageIdentifier)) {
    throw new Error(
      `${packageIdentifier} does not include a license file. Review the package before adding an exception.`
    )
  }

  if (declaredLicense !== "MIT") {
    throw new Error(
      `${packageIdentifier} declares ${declaredLicense} but does not include a license file`
    )
  }

  return `The installed npm package does not include a standalone license file.
Its package metadata and README declare the MIT License; the package author,
repository, exact archive URL, and integrity are recorded with this notice.

MIT License

Copyright (c) ${formatAuthor(packageJson.author)}

${MIT_TERMS}`
}

const main = () => {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error("dist does not exist. Run `npm run build` first.")
  }

  const packageLock = readJson(PACKAGE_LOCK_PATH)
  const packageEntries = Object.entries(packageLock.packages ?? {})
    .filter(
      ([packagePath, packageData]) =>
        packagePath.startsWith("node_modules/") && packageData.dev !== true
    )
    .map(([packagePath, packageData]) => {
      const absolutePackagePath = path.join(PROJECT_ROOT, packagePath)
      const packageJsonPath = path.join(absolutePackagePath, "package.json")

      if (!fs.existsSync(packageJsonPath)) {
        throw new Error(
          `${packagePath} is missing. Run \`npm ci\` before building notices.`
        )
      }

      const packageJson = readJson(packageJsonPath)
      const declaredLicense =
        packageJson.license ?? packageData.license ?? "UNSPECIFIED"
      const licenseFiles = fs
        .readdirSync(absolutePackagePath, { withFileTypes: true })
        .filter(
          (entry) => entry.isFile() && LICENSE_FILE_PATTERN.test(entry.name)
        )
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right, "en"))

      const licenseSections =
        licenseFiles.length > 0
          ? licenseFiles.map((licenseFile) => ({
              name: licenseFile,
              text: normalizeText(
                fs.readFileSync(
                  path.join(absolutePackagePath, licenseFile),
                  "utf8"
                )
              ),
            }))
          : [
              {
                name: "generated MIT fallback",
                text: buildFallbackLicense(packageJson, declaredLicense),
              },
            ]

      if (!packageData.resolved || !packageData.integrity) {
        throw new Error(
          `${packageJson.name}@${packageJson.version} is missing resolved or integrity metadata in package-lock.json`
        )
      }

      return {
        declaredLicense,
        integrity: packageData.integrity,
        licenseSections,
        name: packageJson.name,
        packagePath,
        repository: formatRepository(packageJson.repository),
        resolved: packageData.resolved ?? "",
        version: packageJson.version,
      }
    })
    .sort((left, right) => {
      const nameComparison = left.name.localeCompare(right.name, "en")
      if (nameComparison !== 0) return nameComparison

      const versionComparison = left.version.localeCompare(right.version, "en")
      if (versionComparison !== 0) return versionComparison

      return left.packagePath.localeCompare(right.packagePath, "en")
    })

  const sections = packageEntries.map((entry) => {
    const sources = [
      entry.resolved ? `Package archive: ${entry.resolved}` : "",
      entry.repository ? `Repository: ${entry.repository}` : "",
    ].filter(Boolean)
    const licenses = entry.licenseSections
      .map(
        (licenseSection) =>
          `--- ${licenseSection.name} ---\n${licenseSection.text}`
      )
      .join("\n\n")

    return [
      "=".repeat(79),
      `${entry.name}@${entry.version}`,
      `Installed path: ${entry.packagePath}`,
      `Declared license: ${entry.declaredLicense}`,
      `Integrity: ${entry.integrity}`,
      ...sources,
      ...(entry.name === "tiny-segmenter"
        ? [
            "Additional notice: The package metadata references the original TinySegmenter license, while the npm package also contains an MIT LICENSE file. AutoBucket's bundled LICENSE preserves the original TinySegmenter 0.1 BSD notice; both notices are retained.",
          ]
        : []),
      "",
      licenses,
    ].join("\n")
  })

  const notice = [
    "AutoBucket third-party notices",
    "",
    "AutoBucket source code is licensed under the MIT License. The release",
    "archive also contains third-party software under the licenses reproduced",
    "below. Package archive URLs identify the exact corresponding source.",
    "",
    ...sections,
    "",
  ].join("\n")

  fs.copyFileSync(
    path.join(PROJECT_ROOT, "LICENSE"),
    path.join(DIST_DIR, "LICENSE")
  )
  fs.writeFileSync(
    path.join(DIST_DIR, "THIRD_PARTY_NOTICES.txt"),
    notice,
    "utf8"
  )

  console.info(
    `Third-party notices OK: ${packageEntries.length} production package entries`
  )
}

try {
  main()
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
