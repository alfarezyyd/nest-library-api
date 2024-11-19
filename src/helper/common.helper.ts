import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as fsPromises from 'fs/promises';
import { HttpException } from '@nestjs/common';
import * as fs from 'node:fs';
import * as crypto from 'crypto';
import { Storage } from '@google-cloud/storage';

export class CommonHelper {
  static async handleSaveFile(
    configService: ConfigService,
    singleFile: Express.Multer.File,
    folderName: string,
    cloudStorage: Storage,
  ) {
    const generatedSingleFileName = `${uuid()}-${singleFile.originalname}`;
    if (configService.get<string>('NODE_ENV') === 'PRODUCTION') {
      await cloudStorage
        .bucket(configService.get<string>('BUCKET_NAME'))
        .file(`profile/${generatedSingleFileName}`)
        .save(singleFile.buffer, {
          contentType: singleFile.mimetype,
        });
    } else {
      const folderPath = `${configService.get<string>('MULTER_DEST')}/${folderName}/`;
      await fsPromises.mkdir(folderPath, { recursive: true });
      fs.writeFile(
        folderPath + generatedSingleFileName,
        singleFile.buffer,
        (err) => {
          if (err) {
            throw new HttpException(err, 500);
          }
        },
      );
    }
    return generatedSingleFileName;
  }

  static async compareImagesFromUpload(
    firstImagePath: string | Buffer,
    secondImageFile: Express.Multer.File,
  ) {
    if (firstImagePath === null) {
      return true;
    }
    let firstImage;
    if (!Buffer.isBuffer(firstImagePath)) {
      firstImage = await fsPromises.readFile(firstImagePath);
    } else {
      firstImage = firstImagePath;
    }
    const firstImageBase64 = firstImage.toString('base64');
    const secondImageBase64 = secondImageFile.buffer.toString('base64');

    return firstImageBase64 === secondImageBase64;
  }

  static async generateOneTimePassword(
    lengthOfPassword: number = 6,
  ): Promise<string> {
    const max = Math.pow(10, lengthOfPassword);
    const randomNumber = crypto.randomInt(0, max);
    return randomNumber.toString().padStart(lengthOfPassword, '0');
  }
}
