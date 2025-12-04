AWS CLI setup helpers for BoilerFrame

These files are helper artifacts you can run locally to create the required AWS resources for testing BoilerFrame (S3 bucket, IAM policy, IAM user, access key, SNS topic and Rekognition role).

Important: These scripts will create real AWS resources in your account and print credentials to stdout. Run them only after reviewing and replacing the placeholder variables at the top of the script.

Quick steps
1. Install and configure the AWS CLI (https://aws.amazon.com/cli/). Run `aws configure` to set a user with permission to create IAM, S3, SNS resources.
2. Edit `create-resources.sh` and set BUCKET_NAME, REGION, ACCOUNT_ID, and other variables.
3. Run:

```bash
cd server/aws-cli
chmod +x create-resources.sh
./create-resources.sh
```

Files created
- `server-policy.json` — policy granting S3 and Rekognition permissions for the server user.
- `rekognition-role-trust.json` — trust policy Rekognition will assume to publish to SNS (if you choose to enable SNS notifications).
- `rekognition-role-policy.json` — role policy allowing publish to the SNS topic.
- `create-resources.sh` — bash script that combines the steps using AWS CLI. Edit carefully before running.

Security note
- The script prints an access key and secret for the new IAM user. Treat this as sensitive and store in a secure place; consider creating short-lived credentials or using an IAM role for production.
