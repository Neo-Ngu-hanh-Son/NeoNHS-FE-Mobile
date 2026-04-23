import mime from 'mime';

export const generateImageUploadData = (
  image: {
    localUri: string;
  },
  key?: number
) => {
  if (!key) {
    // Get from the current time
    key = Date.now();
  }
  const fileName = image.localUri.split('/').pop() || `checkin-${key}.jpg`;
  const mimeType = mime.getType(image.localUri) || 'image/jpeg';

  return {
    uri: image.localUri,
    name: fileName,
    type: mimeType,
  };
};
