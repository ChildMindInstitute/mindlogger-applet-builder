import S3 from 'aws-s3';

const S3Config = {
  bucketName: process.env.VUE_APP_BUCKET_NAME,
  dirName: process.env.VUE_APP_DIR_NAME,
  region: process.env.VUE_APP_REGION,
  accessKeyId: process.env.VUE_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.VUE_APP_SECRET_ACCES_KEY,
  s3Url: process.env.VUE_APP_S3_URL
};

export default class ImageUploader {
  constructor() {
    this.client = this.init();
  }

  init() {
    return new S3(S3Config);
  }

  isImageValid(data) {
    if(!data) return 'Please choose some image';

    const img = new Image();
    if(typeof data === 'string') img.src = data;
    else img.src = URL.createObjectURL(data);

    return new Promise(resolve => {
      img.onload = function() {
        let imgWidth = this.width;
        let imgHeight = this.height;

        // < 8192 (8MB)
        const imgSize = Math.round(data.size / 1024);
        if(imgSize > 8192) 
          resolve('Size of image should be less than 8MB');
        // Minimum resolution: 320x566 (lower resolutions will be not be posted)
        if(imgWidth < 320 || imgWidth > 4032) 
          resolve('Width of image should be between 320px and 4032px');
        // Maximum resolution: 4032x3024 (higher resolutions will not be posted)
        if(imgHeight < 566 || imgHeight > 3024)
          resolve('Height of image should be between 566px and 3024px');
        // portrait ratio which should be 4:5 // (width * 1.25)
        // if(imgHeight > imgWidth && (Math.ceil(imgWidth * 1.25) !== imgHeight))
          // resolve('For portrait image ratio should be 4:5');
        // landscape ratio which should be 1.91:1
        // if(imgWidth > imgHeight && (Math.ceil(imgHeight * 1.91) !== imgWidth))
          // resolve('For landscape image ratio should be 1.91:1');

        resolve('');
      };

      img.onerror = () => resolve('Please check if you use correct url');
    });
  }

  uploadImage(file) {
    return this.client.uploadFile(file);
  }

}