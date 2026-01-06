import { Client } from 'minio';

const globalForMinio = globalThis as unknown as {
    minio: Client | undefined;
};

export const minio =
    globalForMinio.minio ??
    new Client({
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT || '9000'),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY || 'verp_minio',
        secretKey: process.env.MINIO_SECRET_KEY || 'verp_minio_secret',
    });

if (process.env.NODE_ENV !== 'production') globalForMinio.minio = minio;

export const BUCKET_NAME = process.env.MINIO_BUCKET || 'v-erp-files';

// Initialize bucket if not exists
export async function ensureBucket() {
    const exists = await minio.bucketExists(BUCKET_NAME);
    if (!exists) {
        await minio.makeBucket(BUCKET_NAME, 'ap-southeast-1');
    }
}

// Upload file and return URL
export async function uploadFile(
    file: Buffer,
    filename: string,
    contentType: string
): Promise<string> {
    await ensureBucket();
    await minio.putObject(BUCKET_NAME, filename, file, file.length, {
        'Content-Type': contentType,
    });
    return `/${BUCKET_NAME}/${filename}`;
}

// Get presigned URL for download
export async function getDownloadUrl(
    filename: string,
    expirySeconds = 3600
): Promise<string> {
    return minio.presignedGetObject(BUCKET_NAME, filename, expirySeconds);
}

// Delete file
export async function deleteFile(filename: string): Promise<void> {
    await minio.removeObject(BUCKET_NAME, filename);
}

export default minio;
