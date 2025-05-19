import { memo } from 'react';
import GaugeComponent from 'react-gauge-component';

const BlunderMeter = ({ score = null }) => {
  if (score === null) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-zinc-400 mb-2">—</div>
          <div className="text-xs text-zinc-500">No blunders yet</div>
        </div>
      </div>
    );
  }

  const gaugeValue = Math.min(Math.abs(score) / 500, 1); // Normalize to 0-1

  return (
    <div className="w-full h-full">
      <GaugeComponent
        value={gaugeValue * 100}
        minValue={0}
        maxValue={100}
        arc={{
          colorArray: ['#10B981', '#F59E0B', '#EF4444'],
          subArcs: [
            { limit: 20 },
            { limit: 60 },
            { limit: 100 }
          ],
          padding: 0.02,
          width: 0.2
        }}
        labels={{
          valueLabel: { formatTextValue: value => `${Math.round(value)}%` },
          tickLabels: {
            type: "outer",
            ticks: [
              { value: 0 },
              { value: 50 },
              { value: 100 }
            ]
          }
        }}
      />
    </div>
  );
};

export default memo(BlunderMeter);