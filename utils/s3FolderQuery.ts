const PDF_FOLDER = "pdf";
const IMAGE_FOLDER = "images";

export const getPdfFileQuery = (fileName: string) => {
  return {
    fileName: `${PDF_FOLDER}/${fileName}`,
    fileType: "application/pdf",
  };
};

export const getImageFileQuery = (fileName: string) => {
  return {
    fileName: `${IMAGE_FOLDER}/${fileName}`,
    fileType: "image/jpeg",
  };
};

// Upload keys are "<timestamp>-<random>-<original name>"; keep the name
export const getFileDisplayName = (fileKey: string) => {
  const parts = fileKey.split("-");
  return parts.length > 2 ? parts.slice(2).join("-") : fileKey;
};
