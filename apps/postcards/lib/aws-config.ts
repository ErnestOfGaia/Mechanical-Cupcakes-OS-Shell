import { S3Client } from "@aws-sdk/client-s3";

export function getBucketConfig() {
  return {
    bucketName: process.env.AWS_BUCKET_NAME ?? "",
    folderPrefix: process.env.AWS_FOLDER_PREFIX ?? "",
  };
}

export function createS3Client() {
  // Explicitly pass credentials so the client works in Docker without an AWS profile.
  // Falls back to the standard SDK credential chain (env vars, instance metadata, etc.)
  const region = process.env.AWS_REGION ?? "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  // Fall back to SDK default chain (useful for local dev with ~/.aws/credentials)
  return new S3Client({ region });
}
