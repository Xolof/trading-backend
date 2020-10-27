const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

function resizeImage (inputFilePath, outputFilePath, height) {
    sharp(inputFilePath)
        .resize({ height: height })
        .toFile(outputFilePath)
        .then(function (newFileInfo) {
            console.log("Image Resized");})
        .catch(function (err) {
            console.log(err);
        });
}

function resizeImages (inputDir, outputDir) {
    console.log(`Saving resized images from ${inputDir} to ${outputDir}`);

    fs.promises.readdir(inputDir, (err, images) => {
        return images;
    }).then((images) => {
        images.forEach((image) => {
           resizeImage(inputDir + "/" + image, outputDir + "/" + image, 200);
        });
    });
}

module.exports = resizeImages;
