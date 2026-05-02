const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET;

async function generatePresignedUrl(req, res) {
  const { fileName, fileType, folder } = req.body;
  const user = req.user;

  if (!fileName || !fileType || !folder) {
    return res.status(400).json({ error: 'fileName, fileType, and folder are required' });
  }

  try {
    const uniqueName = `${uuidv4()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const objectKey = `${folder}/${uniqueName}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: objectKey,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const publicUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${objectKey}`;

    res.json({ presignedUrl, publicUrl });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

module.exports = {
  generatePresignedUrl,
};
