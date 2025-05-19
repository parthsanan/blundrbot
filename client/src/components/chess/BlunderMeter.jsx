import { memo } from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

const BLUNDER_LEVELS = [
  { threshold: 100, label: 'Minor Blunder', color: '#10B981' },
  { threshold: 300, label: 'Medium Blunder', color: '#F59E0B' },
  { threshold: Infinity, label: 'Catastrophic Blunder', color: '#EF4444' }
];

const getBlunderLevel = (score) => {
  const absScore = Math.min(Math.abs(score), 500);
  return {
    ...BLUNDER_LEVELS.find(level => absScore < level.threshold),
    score: absScore
  };
};

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


  const { score: displayScore, label } = getBlunderLevel(score);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <ReactSpeedometer
          width={280}
          height={140}
          minValue={0}
          maxValue={500}
          value={displayScore}
          segments={3}
          customSegmentStops={[0, 100, 300, 500]}
          segmentColors={['#10B981', '#F59E0B', '#EF4444']}
          needleColor="#FFFFFF"
          needleTransition="easeElastic"
          needleTransitionDuration={400}
          currentValueText=" "
          ringWidth={16}
          textColor="transparent"
        />
      </div>
      <div className="text-center mt-1">
        <div className="text-xl font-bold text-white">
          {Math.round(displayScore)}
          <span className="text-xs text-zinc-400 ml-1">cp</span>
        </div>
        <div className="text-xs font-medium text-zinc-300">
          {label}
        </div>
      </div>
    </div>
  );
};

export default memo(BlunderMeter, (prevProps, nextProps) => {
  // Only re-render if the score actually changes
  return prevProps.score === nextProps.score;
});