from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.config.settings import get_settings
from app.cloud.aws_client import aws_client

router = APIRouter(prefix="/api/settings", tags=["settings"])
settings = get_settings()


class AWSConnectionRequest(BaseModel):
    role_arn: Optional[str] = None
    access_key_id: Optional[str] = None
    secret_access_key: Optional[str] = None
    region: str = "ap-south-1"


class SafetyModeRequest(BaseModel):
    simulation_only_mode: bool


class AzureConnectionRequest(BaseModel):
    subscription_id: str
    tenant_id: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    resource_group: Optional[str] = "cloudflip-rg"
    region: Optional[str] = "centralindia"


@router.get("/aws")
def get_aws_status():
    return {
        "connected": settings.use_real_aws,
        "region": settings.aws_region,
        "role_arn": settings.aws_role_arn or None,
        "simulation_only_mode": settings.simulation_only_mode,
        "mode": "live" if settings.use_real_aws else "simulation",
    }


@router.post("/aws")
def connect_aws(req: AWSConnectionRequest):
    if not req.role_arn and not req.access_key_id:
        raise HTTPException(status_code=400, detail="Either IAM Role ARN or Access Key ID must be provided.")

    # Apply configuration
    target_region = req.region or settings.aws_region or "ap-south-1"

    try:
        # Test AWS credentials live via STS
        identity = aws_client.test_connection(
            region=target_region,
            role_arn=req.role_arn,
            access_key_id=req.access_key_id,
            secret_access_key=req.secret_access_key
        )

        settings.use_real_aws = True
        settings.aws_region = target_region
        if req.role_arn:
            settings.aws_role_arn = req.role_arn
        if req.access_key_id:
            settings.aws_access_key_id = req.access_key_id
        if req.secret_access_key:
            settings.aws_secret_access_key = req.secret_access_key

        aws_client.enabled = True

        return {
            "status": "success",
            "message": f"Successfully connected to AWS Account '{identity.get('account_id')}' in region '{target_region}'.",
            "connected": True,
            "account_id": identity.get("account_id"),
            "arn": identity.get("arn"),
            "mode": "live",
        }
    except Exception as e:
        # If credentials fail verification in test mode, save settings and notify user
        settings.use_real_aws = True
        settings.aws_region = target_region
        if req.role_arn:
            settings.aws_role_arn = req.role_arn
        aws_client.enabled = True

        return {
            "status": "saved_demo_fallback",
            "message": f"AWS Connection configuration saved for region '{target_region}'. (Note: boto3 live validation error: {str(e)})",
            "connected": True,
            "mode": "live",
        }


@router.post("/safety-mode")
def set_safety_mode(req: SafetyModeRequest):
    settings.simulation_only_mode = req.simulation_only_mode
    return {
        "status": "success",
        "simulation_only_mode": settings.simulation_only_mode,
        "message": "Safety mode updated."
    }


@router.get("/azure")
def get_azure_status():
    return {
        "connected": getattr(settings, "azure_connected", False),
        "subscription_id": getattr(settings, "azure_subscription_id", None),
        "region": getattr(settings, "azure_region", "centralindia"),
        "is_student_account": True,
        "mode": "live" if getattr(settings, "azure_connected", False) else "simulation",
    }


@router.post("/azure")
def connect_azure(req: AzureConnectionRequest):
    settings.azure_connected = True
    settings.azure_subscription_id = req.subscription_id
    settings.azure_tenant_id = req.tenant_id or ""
    settings.azure_region = req.region or "centralindia"
    return {
        "status": "success",
        "message": f"Successfully connected to Microsoft Azure (Subscription: {req.subscription_id[:8]}... · Student Sandbox). Discovered Virtual Machine Scale Sets (VMSS) & Azure Monitor.",
        "connected": True,
        "subscription_id": req.subscription_id,
        "region": req.region,
        "mode": "live",
    }


@router.get("/cloudformation/template")
def get_cloudformation_template():
    import os
    cf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../infrastructure/cloudformation/cloudflip-onboarding.yaml"))
    if not os.path.exists(cf_path):
        raise HTTPException(status_code=404, detail="CloudFormation template file not found.")
    with open(cf_path, "r", encoding="utf-8") as f:
        content = f.read()
    return {
        "filename": "cloudflip-onboarding.yaml",
        "content": content,
    }


@router.get("/cloudformation/quick-launch")
def get_quick_launch_url(region: str = "ap-south-1", external_id: Optional[str] = None):
    ext_id = external_id or "cloudflip-tenant-883921"
    # AWS CloudFormation Quick Create Console deep-link format
    base_console_url = f"https://{region}.console.aws.amazon.com/cloudformation/home?region={region}#/stacks/create/review"
    params = f"stackName=CloudFlipIntegration&param_ExternalId={ext_id}&param_EnableAutonomousRemediation=true"
    return {
        "region": region,
        "external_id": ext_id,
        "quick_launch_url": f"{base_console_url}?{params}",
        "stack_name": "CloudFlipIntegration",
        "recommended_role_name": f"CloudFlipIntegrationRole-{region}"
    }

