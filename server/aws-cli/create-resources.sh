#!/usr/bin/env bash
set -euo pipefail

# BoilerFrame AWS resource creation helper script
# Edit the variables below before running.

BUCKET_NAME="my-boilerframe-boilerframe-uploads"
REGION="us-east-1"
ACCOUNT_ID="225279655691"
POLICY_NAME="BoilerFrameServerPolicy"
USER_NAME="boilerframe-server-user"
SNS_TOPIC_NAME="boilerframe-completions"
REK_ROLE_NAME="BoilerFrameRekognitionRole"

echo "This script will create S3 bucket, IAM policy, IAM user, access key, SNS topic and Rekognition role."
echo "Edit the script variables before running."
read -p "Proceed? (y/N) " proceed
if [[ "$proceed" != "y" && "$proceed" != "Y" ]]; then
  echo "Aborted"
  exit 1
fi

echo "1) Creating S3 bucket: $BUCKET_NAME"
if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" || true
else
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" --create-bucket-configuration LocationConstraint=$REGION || true
fi

echo "2) Creating managed policy from server-policy.json (replace bucket placeholders if needed)"
POLICY_ARN=$(aws iam create-policy --policy-name "$POLICY_NAME" --policy-document file://server-policy.json --query 'Policy.Arn' --output text 2>/dev/null || true)
if [ -z "$POLICY_ARN" ]; then
  echo "Policy may already exist, attempting to find it"
  POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn | [0]" --output text)
fi
echo "Policy ARN: $POLICY_ARN"

echo "3) Creating IAM user: $USER_NAME"
aws iam create-user --user-name "$USER_NAME" || true

echo "4) Attaching policy to user"
aws iam attach-user-policy --user-name "$USER_NAME" --policy-arn "$POLICY_ARN"

echo "5) Create access keys for user (printed below)"
CREDS_JSON=$(aws iam create-access-key --user-name "$USER_NAME")
ACCESS_KEY_ID=$(echo "$CREDS_JSON" | jq -r .AccessKey.AccessKeyId)
SECRET_ACCESS_KEY=$(echo "$CREDS_JSON" | jq -r .AccessKey.SecretAccessKey)
echo "ACCESS_KEY_ID=$ACCESS_KEY_ID"
echo "SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY"

echo "6) Create SNS topic (for later Rekognition notifications)"
SNS_ARN=$(aws sns create-topic --name "$SNS_TOPIC_NAME" --output text)
echo "SNS Topic ARN: $SNS_ARN"

echo "7) Create Rekognition role (trust policy + publish policy)"
aws iam create-role --role-name "$REK_ROLE_NAME" --assume-role-policy-document file://rekognition-role-trust.json || true

# Prepare Rekognition role policy file by replacing placeholders
TMP_POLICY_FILE=$(mktemp)
sed "s|REPLACE_REGION|$REGION|g; s|REPLACE_ACCOUNT_ID|$ACCOUNT_ID|g; s|REPLACE_SNS_TOPIC|$SNS_TOPIC_NAME|g" rekognition-role-policy.json > "$TMP_POLICY_FILE"
aws iam put-role-policy --role-name "$REK_ROLE_NAME" --policy-name "RekognitionPublishPolicy" --policy-document file://"$TMP_POLICY_FILE"
rm "$TMP_POLICY_FILE"

echo "Done. Update your server/.env with the ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION and S3_BUCKET values printed above."
echo "If you'd like SNS-based Rekognition notifications, use the SNS topic ARN above and pass the RoleArn for $REK_ROLE_NAME when calling StartFaceSearch NotificationChannel (role must be the role's ARN)."
