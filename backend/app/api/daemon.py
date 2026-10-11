from fastapi import APIRouter
from app.services.daemon import telemetry_daemon

router = APIRouter(prefix="/api/daemon", tags=["daemon"])


@router.get("/status")
def get_daemon_status():
    return telemetry_daemon.get_status()


@router.post("/start")
def start_daemon():
    telemetry_daemon.start()
    return {
        "status": "success",
        "message": "24/7 Telemetry & Autonomous Scaling Daemon started.",
        "daemon": telemetry_daemon.get_status(),
    }


@router.post("/stop")
def stop_daemon():
    telemetry_daemon.stop()
    return {
        "status": "success",
        "message": "24/7 Telemetry & Autonomous Scaling Daemon paused.",
        "daemon": telemetry_daemon.get_status(),
    }


@router.post("/trigger")
def trigger_sweep():
    result = telemetry_daemon.trigger_sweep_now()
    return {
        "status": "success",
        "message": "Out-of-band telemetry sweep executed.",
        "result": result,
        "daemon": telemetry_daemon.get_status(),
    }
