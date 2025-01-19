import { BadRequestException, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsS3Service {
  private bucketName;
  private serviceStorage;

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME;
    this.serviceStorage = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async downloadImage(filePath: string) {
    console.log(filePath, 'filePath');
    try {
      if (!filePath) return;
      const config = {
        Bucket: this.bucketName,
        Key: filePath,
      };
      return await this.serviceStorage.getSignedUrlPromise('getObject', config);
    } catch (error) {
      throw new Error('Could not download image');
    }
  }

  async uploadImage(filePath: string, buffer: Buffer) {
    try {
      const config = {
        Key: filePath,
        Bucket: this.bucketName,
        Body: buffer,

      };
      await this.serviceStorage.putObject(config).promise();
      const url = await this.downloadImage(filePath);
      return url;
    } catch (e) {
      throw new BadRequestException('Could not upload file');
    }
  }

  async deleteImg(filePath) {
    try {
      if (!filePath) return;
      const config = {
        Bucket: this.bucketName,
        Key: filePath,
      };
      await this.serviceStorage.deleteObject(config).promise();
      return 'deleted successfully';
    } catch (error) {
      console.log(error);
    }
  }
}
