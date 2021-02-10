import S3 from 'aws-s3';

const S3Config = {
  bucketName: process.env.VUE_APP_BUCKET_NAME,
  region: process.env.VUE_APP_REGION,
  accessKeyId: process.env.VUE_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.VUE_APP_SECRET_ACCES_KEY,
  s3Url: process.env.VUE_APP_S3_URL
};

export function isAudioUrlValid(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.addEventListener('canplay', () => resolve(url));
    audio.addEventListener('error', () => {
      reject({ type: 'error', message: 'Please check if you use correct audio url.', duration: 3000 });
    });
  });
}

export class Uploader {
  constructor(dirName = '') {
    this.client = this.init(dirName);
  }

  init(dirName) {
    S3Config.dirName = dirName;
    return new S3(S3Config);
  }

  upload(file) {
    return this.client.uploadFile(file);
  }

}