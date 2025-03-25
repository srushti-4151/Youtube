// This function crops an image based on the given coordinates and size (pixelCrop) 
// and returns the cropped image as a Base64-encoded JPEG.
export default async function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc; // Load image from given source (URL or Base64)
    image.onload = () => {
       // Create a canvas to draw the cropped image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

       // Set canvas size to match the cropping area
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // Draw the cropped portion of the image onto the canvas
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Convert the canvas to a Base64-encoded JPEG and return it
      resolve(canvas.toDataURL("image/jpeg"));
    };
     // Handle image loading errors
    image.onerror = (error) => reject(error);
  });
}
