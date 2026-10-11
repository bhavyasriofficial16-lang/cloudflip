"""
24/7 Background Telemetry & Autonomous Scaling Daemon.

Continuously monitors live/simulated AWS infrastructure metrics,
evaluates predictive time-series forecasting (EMA + derivative slope),
and triggers autonomous proactive remediation and closed-loop scale-down sweeps.
"""
import threading
import time
import logging
from datetime import datetime
from typing import Dict, Any, Optional

from app.database.session import SessionLocal
from app.models import models as m
from app.actions.autonomous_agent import run_autonomous_remediation_sweep
from app.services.local_metrics_simulator import generate_scenario
from app.ml.prediction.engine import forecast

logger = logging.getLogger("cloudflip.daemon")


class TelemetryDaemon:
    def __init__(self, interval_seconds: int = 30):
        self.interval_seconds = interval_seconds
        self.is_running = False
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        
        # Daemon telemetry statistics
        self.total_sweeps = 0
        self.total_actions_executed = 0
        self.last_sweep_at: Optional[datetime] = None
        self.started_at: Optional[datetime] = None
        self.last_forecast_summary: Dict[str, Any] = {}

    def start(self):
        """Starts the persistent background daemon thread."""
        if self.is_running:
            logger.info("Daemon already running.")
            return

        self.is_running = True
        self._stop_event.clear()
        self.started_at = datetime.utcnow()
        self._thread = threading.Thread(target=self._run_loop, name="CloudFlipTelemetryDaemon", daemon=True)
        self._thread.start()
        logger.info(f"⚡ CloudFlip 24/7 Telemetry Daemon started with {self.interval_seconds}s interval.")

    def stop(self):
        """Signals the background daemon to stop gracefully."""
        if not self.is_running:
            return
        self.is_running = False
        self._stop_event.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=3.0)
        logger.info("🛑 CloudFlip Telemetry Daemon stopped.")

    def trigger_sweep_now(self) -> Dict[str, Any]:
        """Runs an immediate out-of-band sweep cycle."""
        logger.info("Triggering out-of-band daemon sweep cycle...")
        return self._execute_cycle()

    def get_status(self) -> Dict[str, Any]:
        """Returns current operational health and metrics."""
        uptime_seconds = (datetime.utcnow() - self.started_at).total_seconds() if self.started_at and self.is_running else 0
        return {
            "status": "RUNNING" if self.is_running else "STOPPED",
            "interval_seconds": self.interval_seconds,
            "total_sweeps": self.total_sweeps,
            "total_actions_executed": self.total_actions_executed,
            "last_sweep_at": self.last_sweep_at.isoformat() if self.last_sweep_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "uptime_seconds": int(uptime_seconds),
            "last_forecast": self.last_forecast_summary,
        }

    def _run_loop(self):
        """Main loop executed in background daemon thread."""
        while not self._stop_event.is_set():
            try:
                self._execute_cycle()
            except Exception as e:
                logger.error(f"Error during daemon telemetry sweep: {e}", exc_info=True)
            # Sleep in small increments for responsive shutdown
            self._stop_event.wait(self.interval_seconds)

    def _execute_cycle(self) -> Dict[str, Any]:
        """Performs a single telemetry scan, prediction check, and remediation sweep."""
        self.total_sweeps += 1
        self.last_sweep_at = datetime.utcnow()
        db = SessionLocal()

        try:
            # 1. Predictive Telemetry Evaluation
            # Generates/polls 30-step window and forecasts 20 minutes ahead
            series = generate_scenario("sudden_surge", n=30, base=8000, multiplier=3.5)
            f = forecast(series, step_minutes=3.0, horizon_minutes=20, metric_name="traffic")
            
            self.last_forecast_summary = {
                "horizon_minutes": f.horizon_minutes,
                "predicted_value": f.predicted_value,
                "model_name": f.model_name,
                "trend_slope": "POSITIVE_SURGE" if f.predicted_value > series[-1] else "NEGATIVE_COOLDOWN",
                "evaluated_at": self.last_sweep_at.isoformat(),
            }

            # 2. Check if a high-pressure bottleneck recommendation should be queued
            if f.predicted_value > 15000:
                # Check if pending recommendation exists
                existing = db.query(m.Recommendation).filter_by(status=m.ApprovalStatus.pending).first()
                if not existing:
                    target_instances = min(130, max(4, int(f.predicted_value / 1200)))
                    new_rec = m.Recommendation(
                        title=f"Predictive Scale-Up: Traffic projected to surge to {int(f.predicted_value)} RPM",
                        description=f"Daemon forecasted surge ({f.predicted_value:.0f} RPM) in {f.horizon_minutes}m. Proactively scaling Auto Scaling fleet to maintain 180ms SLA bounds.",
                        resource_id="orders-web-asg-1",
                        category="capacity",
                        severity="high",
                        confidence="high",
                        current_state={"instances": 4},
                        recommended_state={"instances": target_instances},
                        status=m.ApprovalStatus.pending,
                        estimated_cost_per_hour=14.40,
                    )
                    db.add(new_rec)
                    db.commit()

            # 3. Autonomous Remediation Sweep
            sweep_results = run_autonomous_remediation_sweep(db)
            executed_in_sweep = sum(1 for r in sweep_results if r.get("status") == "success" or r.get("action_type"))
            self.total_actions_executed += executed_in_sweep

            # Log daemon heartbeat into ActivityLog every 5 sweeps
            if self.total_sweeps % 5 == 1:
                db.add(m.ActivityLog(
                    event=f"🔄 24/7 Autonomous Daemon completed sweep #{self.total_sweeps} (Traffic: {int(f.predicted_value)} RPM, Horizon: {f.horizon_minutes}m)",
                    result="OK"
                ))
                db.commit()

            return {
                "sweep": self.total_sweeps,
                "timestamp": self.last_sweep_at.isoformat(),
                "actions_executed": executed_in_sweep,
                "forecast": self.last_forecast_summary,
            }
        finally:
            db.close()


# Global daemon singleton instance
telemetry_daemon = TelemetryDaemon(interval_seconds=30)
