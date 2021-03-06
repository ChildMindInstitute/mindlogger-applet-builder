import S3 from 'aws-s3';

export function isAudioUrlValid(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.addEventListener('canplay', () => resolve(url));
    audio.addEventListener('error', () => {
      reject('Please check if you use correct audio url.');
    });
  });
}

export function isImageValid(data) {

  const img = new Image();
  if(typeof data === 'string') img.src = data;
  else img.src = URL.createObjectURL(data);

  return new Promise((resolve, reject) => {
    img.onload = function() {
      let imgWidth = this.width;
      let imgHeight = this.height;

      // < 8192 (8MB)
      const imgSize = Math.round(data.size / 1024);
      if(imgSize > 8192) 
        reject('Size of image should be less than 8MB.');
      // Minimum resolution: 320x566 (lower resolutions will be not be posted)
      if(imgWidth <= 100 || imgWidth > 1920)
        reject('Width of image should be between 100px and 1920px.');
      // Maximum resolution: 4032x3024 (higher resolutions will not be posted)
      if(imgHeight <= 100 || imgHeight > 1920)
        reject('Height of image should be between 100px and 1920px.');
      // portrait ratio which should be 4:5 // (width * 1.25)
      // if(imgHeight > imgWidth && (Math.ceil(imgWidth * 1.25) !== imgHeight))
        // reject('For portrait image ratio should be 4:5');
      // landscape ratio which should be 1.91:1
      // if(imgWidth > imgHeight && (Math.ceil(imgHeight * 1.91) !== imgWidth))
        // reject('For landscape image ratio should be 1.91:1');

      resolve(data);
    };

    img.onerror = () => reject('Please check if you use correct image url.');
  });
}

export class Uploader {
  constructor(dirName = '') {
    this.client = this.init(dirName);
  }

  init(dirName) {
    const S3Config = {
      bucketName: process.env.VUE_APP_BUCKET_NAME,
      region: process.env.VUE_APP_REGION,
      accessKeyId: process.env.VUE_APP_ACCESS_KEY_ID,
      secretAccessKey: process.env.VUE_APP_SECRET_ACCES_KEY,
      s3Url: process.env.VUE_APP_S3_URL,
      dirName
    };

    return new S3(S3Config);
  }

  upload(file) {
    return this.client.uploadFile(file);
  }

}