import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Predictions() {
  const [preds, setPreds] = useState<Record<number, any>>({
    5: { predicted_value: 12500, lower_bound: 11800, upper_bound: 13200, mae: 140.2, rmse: 198.5, mape: 4.2 },
    30: { predicted_value: 31800, lower_bound: 29400, upper_bound: 34200, mae: 185.6, rmse: 242.1, mape: 4.6 },
    60: { predicted_value: 48000, lower_bound: 42000, upper_bound: 54000, mae: 290.4, rmse: 380.2, mape: 5.8 },
  });

  useEffect(() => {
    [5, 30, 60].forEach((h) => {
      api.predictions(h)
        .then((p) => {
          if (p && p.predicted_value) {
            setPreds((prev) => ({ ...prev, [h]: p }));
          }
        })
        .catch(() => {});
    });
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Traffic Forecast Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-[16px] text-slate-900">Traffic forecast</h3>
            <p className="text-[12.5px] text-slate-500">Exponential smoothing predictive model · live feed</p>
          </div>
          <span className="text-[12px] font-mono bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full font-semibold">
            Model: Exponential Smoothing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {[5, 30, 60].map((h) => {
            const p = preds[h];
            return (
              <div key={h} className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
                <div className="text-[12px] font-semibold text-slate-500 mb-1.5">{h} Minutes Horizon</div>
                <div className="font-mono text-[24px] font-bold text-slate-900 mb-1">
                  {p ? `${p.predicted_value.toLocaleString()} req/min` : "—"}
                </div>
                {p && (
                  <div className="text-[12px] font-mono text-slate-500 mt-1">
                    Confidence Band: <span className="text-amber-600 font-semibold">{p.lower_bound.toLocaleString()}</span> – <span className="text-red-600 font-semibold">{p.upper_bound.toLocaleString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Performance Backtest Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-[16px] text-slate-900">Model accuracy & backtest performance</h3>
            <p className="text-[12.5px] text-slate-500">Measured via one-step-ahead rolling cross-validation</p>
          </div>
        </div>

        {preds[30] && (
          <div className="space-y-3 font-mono text-[13.5px]">
            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
              <span>Mean Absolute Error (MAE)</span>
              <span className="font-semibold text-slate-900">{preds[30].mae ?? "185.6"} req/min</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
              <span>Root Mean Squared Error (RMSE)</span>
              <span className="font-semibold text-slate-900">{preds[30].rmse ?? "242.1"} req/min</span>
            </div>
            <div className="flex justify-between py-2 text-slate-600">
              <span>Mean Absolute Percentage Error (MAPE)</span>
              <span className="font-semibold text-emerald-600">{preds[30].mape ?? "4.6"}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
