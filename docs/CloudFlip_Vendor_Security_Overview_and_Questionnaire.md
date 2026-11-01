# CloudFlip: Enterprise Security Overview & Vendor Assessment (SIG-Lite / CAIQ)

**Product:** CloudFlip (Autonomous Cloud Telemetry & Predictive Autoscaling)  
**Operated by:** CloudFlip Systems / Bhavya Sri Boddeti (Founder & Systems Engineer)  
**Security Inquiries:** `security@cloudflip.me` &bull; **Legal / DPA:** `legal@cloudflip.me` &bull; **Privacy:** `privacy@cloudflip.me`  
**Security Policy (RFC 9116):** [https://cloudflip.me/.well-known/security.txt](https://cloudflip.me/.well-known/security.txt)  
**Effective Date:** November 2026  

---

## Part 1: One-Page Executive Security Overview

### 1. Architecture & Threat Model
CloudFlip is an autonomous predictive telemetry and closed-loop autoscaling platform. It is engineered from first principles with a zero-trust, out-of-band architecture:
* **Out-of-Band Telemetry:** CloudFlip never sits in the critical network path of your applications. It does not proxy user traffic, inspect HTTP packets, or terminate customer TLS sessions.
* **100% Read-Only Default (Shadow Mode):** The official 1-click CloudFormation onboarding template (`cloudflip-onboarding.yaml`) defaults to `EnableAutonomousRemediation: false`. CloudFlip starts with read-only access to CloudWatch metric aggregates and resource metadata (`ec2:Describe*`, `autoscaling:Describe*`).
* **Optional Opt-In Remediation:** Write permissions (`autoscaling:SetDesiredCapacity`) are enabled only if explicitly configured by the customer. Scaling actions are bounded by strict invariant guardrails (3x blast-radius ceiling, 5-minute anti-thrashing cooldown, cost impact ceiling).

### 2. Authentication & Credential Governance
* **Zero Long-Lived Keys:** CloudFlip never requests AWS root credentials, IAM access keys, or secret keys.
* **STS Cross-Account AssumeRole:** Authentication is conducted via AWS Security Token Service (STS) Cross-Account IAM Roles.
* **Confused Deputy Protection:** Every cross-account role requires a customer-unique `sts:ExternalId` generated cryptographically by CloudFlip.
* **Instant Customer Revocation:** Customers retain 100% sovereign control. Deleting the CloudFormation stack or IAM role in the AWS Console permanently severs CloudFlip's access within seconds.

### 3. Data Classification & Privacy Boundary
* **Data Never Ingested:** Zero customer PII, zero database contents, zero HTTP request/response payloads, zero source code, zero environment secrets.
* **Data Ingested:** Aggregated numeric time-series (CPU%, network I/O, request counts, p95/p99 tail latency) and resource identifiers (instance types, AZs, ASG names).
* **Storage & Encryption:**
  * **In Transit:** TLS 1.2 and TLS 1.3 enforced across all API endpoints and telemetry probes.
  * **At Rest:** AES-256 volume encryption on underlying PostgreSQL databases (AWS KMS managed keys).
  * **Retention:** Rolling 30-day purge for telemetry series. Upon client disconnection, role references are deleted within 24 hours, and historical telemetry is purged within 14 calendar days.

### 4. Fail-Open Reliability Guarantee
* **Shadow Mode:** CloudFlip is structurally incapable of affecting production services. If CloudFlip experiences a complete service disruption, your applications and AWS infrastructure continue running with **100% zero impact**.
* **Autonomous Mode:** If CloudFlip becomes unreachable, all customer EC2/ASG instances remain at their current desired capacity without interruption.

---

## Part 2: Vendor Security Questionnaire (Standard SIG-Lite / CAIQ Answers)

| # | Security Domain / Question | CloudFlip Standard Response |
| :--- | :--- | :--- |
| **1.1** | **Does CloudFlip hold a SOC 2 Type II attestation?** | **Pre-SOC 2 (In Progress).** CloudFlip is an agile engineering company founded by Bhavya Sri Boddeti. We do not currently hold a formal SOC 2 Type II report (on our enterprise compliance roadmap). However, our technical infrastructure is architected in direct compliance with SOC 2 Trust Services Criteria (least privilege, out-of-band ingestion, TLS 1.3/AES-256 encryption, zero long-lived credentials, and immutable audit logs). |
| **1.2** | **Does CloudFlip offer a standard Data Processing Agreement (DPA)?** | **Yes.** CloudFlip provides a standard DPA incorporating European Commission Standard Contractual Clauses (SCCs) and India DPDP Act 2023 provisions upon request. Contact `legal@cloudflip.me`. |
| **2.1** | **How does CloudFlip access our AWS environment?** | Via an AWS STS Cross-Account IAM Role created by your administrator using our open CloudFormation template. A unique tenant `ExternalID` is enforced on every `sts:AssumeRole` call. |
| **2.2** | **Can CloudFlip access customer data or databases?** | **No.** Our IAM policy is strictly restricted to CloudWatch telemetry and EC2/ASG metadata. It contains no permissions for Amazon S3 (`s3:GetObject`), DynamoDB, RDS Data API, or AWS Secrets Manager. |
| **2.3** | **Can CloudFlip terminate production databases or delete VMs?** | **No.** Even when autonomous remediation is enabled, the policy is narrowly scoped to `autoscaling:SetDesiredCapacity`. CloudFlip cannot terminate standalone EC2 instances, delete RDS clusters, or modify VPC security groups. |
| **3.1** | **Where is customer telemetry hosted?** | Primary infrastructure is hosted in Amazon Web Services (AWS) in the **ap-south-1 (Mumbai)** region, with multi-region CloudWatch read connectivity across US and European AWS regions. |
| **3.2** | **Who are CloudFlip’s sub-processors?** | AWS (compute and database hosting), Cloudflare (DNS, DDoS defense, TLS termination), Skydo & Razorpay (PCI-DSS compliant payment processing), and Supabase (authentication metadata). |
| **4.1** | **How are data access and deletion requests handled?** | We acknowledge formal privacy requests within **48 hours** and complete data export or permanent deletion within **30 calendar days**. Contact `privacy@cloudflip.me`. |
| **4.2** | **What happens to data when an account is terminated?** | All telemetry ingestion stops immediately. IAM role references are deleted within **24 hours**, and cached metric aggregations are permanently purged from active storage within **14 calendar days**. |
| **5.1** | **How does CloudFlip handle vulnerability reporting?** | We follow RFC 9116 coordinated vulnerability disclosure. Our policy is published at `/.well-known/security.txt`. Security researchers and customers can report issues to `security@cloudflip.me`. |
| **5.2** | **What guardrails prevent automated over-scaling?** | 5 invariant guardrails: 80% model confidence gate, $500/hr burn rate ceiling, 5-minute anti-thrashing cooldown, 3.0x blast-radius limit (hard clamps 4 to 120 instances), and post-action metric verification with auto-rollback. |

---

## Contact & Execution
For custom enterprise vendor onboarding, architecture reviews, or executing a custom DPA:
* **Founder & Lead Systems Engineer:** Bhavya Sri Boddeti
* **Enterprise Legal & DPA Requests:** `legal@cloudflip.me`
* **Information Security Officer:** `security@cloudflip.me`
* **General & Sales Inquiries:** `sales@cloudflip.me`
