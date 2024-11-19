import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class CloudStorageService {
  constructor(private readonly configService: ConfigService) {}

  private STORAGE: Storage;

  async loadCloudStorageInstance(): Promise<Storage> {
    if (this.STORAGE === undefined) {
      this.STORAGE = new Storage();
    }
    return this.STORAGE;
  }

  async downloadFromCloudStorage(filePath: string): Promise<Buffer> {
    const cloudStorageInstance = await this.loadCloudStorageInstance();
    const bucket = cloudStorageInstance.bucket(
      this.configService.get<string>('BUCKET_NAME'),
    );
    const file = bucket.file(filePath);
    const fileStream = file.createReadStream();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      fileStream
        .on('data', (chunk) => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });
  }
}
