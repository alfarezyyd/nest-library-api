import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as fsPromises from 'fs/promises';
import { HttpException } from '@nestjs/common';
import * as fs from 'node:fs';

export class CommonHelper {
  static async handleSaveFile(
    configService: ConfigService,
    singleFile: Express.Multer.File,
    folderName: string,
  ) {
    const generatedSingleFileName = `${uuid()}-${singleFile.originalname}`;
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
    return generatedSingleFileName;
  }
}
