import { NextResponse } from 'next/server';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
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

  const { fileName, fileType, tenant, directory } = await request.json();
  const key = `${tenant}/${directory}/${fileName}`;

  try {
    await s3.send(new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    }));
    const cdnUrl = process.env.CDN_URL || `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    return NextResponse.json({ error: 'File already exists', existingUrl: `${cdnUrl}/${key}` }, { status: 409 });
  } catch (err: any) {
    if (err.name !== 'NotFound') throw err;
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const cdnUrl = process.env.CDN_URL || `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  
  return NextResponse.json({ uploadUrl, finalUrl: `${cdnUrl}/${key}` });
}
