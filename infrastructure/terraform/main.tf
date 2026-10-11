# Minimal starting point for the CloudFlip IAM role — read-only discovery
# and monitoring permissions plus a narrowly scoped Auto Scaling write
# permission for the one action type the MVP supports.
#
# This is NOT a complete Terraform setup (no backend/state config, no
# provider version pinning beyond the basics) — treat it as a template
# to adapt to your AWS account and expand as new action types are added.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "aws_region" {
  default = "ap-south-1"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_iam_role" "cloudflip_role" {
  name = "cloudflip-discovery-role"

  # Replace the trust policy below with your actual trusted principal
  # (e.g. the ARN of the backend's execution role) before applying.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = "arn:aws:iam::ACCOUNT_ID:root" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "cloudflip_readonly" {
  name = "cloudflip-readonly"
  role = aws_iam_role.cloudflip_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Discovery"
        Effect = "Allow"
        Action = [
          "ec2:Describe*",
          "ecs:Describe*", "ecs:List*",
          "rds:Describe*",
          "s3:ListAllMyBuckets", "s3:GetBucketLocation", "s3:GetBucketTagging",
          "sqs:GetQueueAttributes", "sqs:ListQueues", "sqs:ListQueueTags",
          "elasticloadbalancing:Describe*",
          "autoscaling:Describe*",
          "lambda:List*", "lambda:GetFunction*",
          "cloudwatch:GetMetricStatistics", "cloudwatch:GetMetricData", "cloudwatch:ListMetrics",
          "tag:GetResources",
        ]
        Resource = "*"
      },
      {
        Sid      = "ControlledScaling"
        Effect   = "Allow"
        Action   = ["autoscaling:SetDesiredCapacity"]
        Resource = "*"
        # Tighten with a Condition on resource tags in production —
        # this is intentionally broad only for the local MVP.
      }
    ]
  })
}
