import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { cookies } from 'next/headers';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  const auth = (await cookies()).get('auth');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const tenant = formData.get('tenant') as string;
  const directory = formData.get('directory') as string;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${tenant}/${directory}/${file.name}`;

  // Check if file already exists
  try {
    await s3.send(new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    }));
    return NextResponse.json({ error: 'File already exists at this location' }, { status: 409 });
  } catch (err: any) {
    if (err.name !== 'NotFound') {
      throw err;
    }
  }

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  const cdnUrl = process.env.CDN_URL || `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  const url = `${cdnUrl}/${key}`;
  
  return NextResponse.json({ url });
}
