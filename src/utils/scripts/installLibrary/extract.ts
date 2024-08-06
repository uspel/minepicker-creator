import { createReadStream, createWriteStream, rmSync, existsSync, statSync } from "fs";
import { SingleBar } from "cli-progress";
import redirectable from "follow-redirects";
import { extract } from "tar";
import { join } from "path";

import message from "../../message";
import Data from "../../../data";

const reservedPaths = [
  // Should not be included in installed libraries. If they are, remove them.
  Data.scriptLibrariesDirectoryName,
];

const extractLibrary = (libraryCacheDirectory: string, url: string, progressBar: SingleBar) =>
  new Promise<void>((resolve, reject) => {
    const libraryArchivePath = join(libraryCacheDirectory, "library");
    const libraryArchiveWriteStream = createWriteStream(libraryArchivePath);

    const request = redirectable.https.get(url, (response) => {
      const totalSize = parseInt(response.headers["content-length"]!);

      progressBar.start(totalSize, 0, {
        stage: "Downloading...",
      });

      response.on("data", (chunk) => {
        progressBar.increment(chunk.length);
      });

      response.pipe(libraryArchiveWriteStream).on("error", reject);
    });

    request.on("error", reject);

    libraryArchiveWriteStream.on("error", reject);
    libraryArchiveWriteStream.on("finish", async () => {
      const totalSize = statSync(libraryArchivePath).size;
      const libraryArchiveReadStream = createReadStream(libraryArchivePath);

      progressBar.setTotal(totalSize);
      progressBar.update(0, {
        stage: "Extracting...",
      });

      libraryArchiveReadStream.on("data", (chunk) => {
        progressBar.increment(chunk.length);
      });

      libraryArchiveReadStream
        .pipe(extract({ cwd: libraryCacheDirectory }))
        .on("error", reject)
        .on("finish", () => {
          rmSync(libraryArchivePath);

          for (const reservedPath of reservedPaths) {
            const absolutePath = join(libraryCacheDirectory, reservedPath);

            if (!existsSync(absolutePath)) continue;

            rmSync(absolutePath, { force: true, recursive: true });
            message(`"${reservedPath}" is a reserved script library path and has been removed.`, "information");
          }

          resolve();
        });
    });
  });

export default extractLibrary;
