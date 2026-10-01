export async function convertImageToWebP(
  file: File,
  maxDimension = 2400,
  quality = 0.82
): Promise<File> {
  const bitmap =
    await createImageBitmap(file);

  const originalWidth =
    bitmap.width;

  const originalHeight =
    bitmap.height;

  const largestSide =
    Math.max(
      originalWidth,
      originalHeight
    );

  const scale =
    largestSide > maxDimension
      ? maxDimension / largestSide
      : 1;

  const width =
    Math.round(
      originalWidth * scale
    );

  const height =
    Math.round(
      originalHeight * scale
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext("2d");

  if (!context) {
    bitmap.close();

    throw new Error(
      "Could not process image."
    );
  }

  context.drawImage(
    bitmap,
    0,
    0,
    width,
    height
  );

  bitmap.close();

  const blob =
    await new Promise<Blob>(
      (
        resolve,
        reject
      ) => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(
                new Error(
                  "Could not convert image."
                )
              );

              return;
            }

            resolve(result);
          },
          "image/webp",
          quality
        );
      }
    );

  const nameWithoutExtension =
    file.name.replace(
      /\.[^/.]+$/,
      ""
    );

  return new File(
    [blob],
    `${nameWithoutExtension}.webp`,
    {
      type: "image/webp",
    }
  );
}