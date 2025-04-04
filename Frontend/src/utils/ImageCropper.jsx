// This ImageCropper component allows users to upload and crop an image before saving it. 
// It uses react-easy-crop for cropping and a utility function getCroppedImg.js to extract the cropped image.
import React, { useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./getCroppedImg.js"; // Utility function to crop the image
import { handleError } from "./toast.js"

const ImageCropper = ({ cropType, onCropComplete, onClose }) => {
  const [image, setImage] = useState(null); //Stores the uploaded image.
  const [crop, setCrop] = useState({ x: 0, y: 0 }); //Controls the cropping position. coordinates
  const [zoom, setZoom] = useState(1); //zoom: Controls the zoom level.
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); //Stores the selected crop area in pixels.

  // const aspectRatio = cropType === "avatar" ? 1 : 16 / 9;
  const aspectRatio = cropType === "avatar" ? 1 : cropType === "tweet" ? 1 : 16 / 9;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // if (file) {
    //   const reader = new FileReader();
    //   reader.onload = () => setImage(reader.result);
    //   reader.readAsDataURL(file);
    // }
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file); // Create a temporary URL for the file
    img.onload = () => {
      // if (img.width < 1024 || img.height < 576) {
      //   handleError("Please upload an image of at least 1024x576 pixels.");
      //   return;
      // }
      
      // Read the file only if it meets the resolution requirement
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    };
  };

  const handleCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels); // Store cropped area pixels
  };

  const handleSave = async () => {
    if (!image || !croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    onCropComplete(croppedImage, cropType);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="dark:bg-gray-800 bg-gray-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Crop {cropType}</h2>
        
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {image && (
          <div className="relative w-[300px] h-[300px] mt-4">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
        )}

        <div className="flex justify-between mt-3">
          <button className="bg-[#AA60C8] text-white px-3 py-1 rounded" onClick={handleSave}>
            Crop & Save
          </button>
          <button className="bg-[#BE5985] text-white px-3 py-1 rounded" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
