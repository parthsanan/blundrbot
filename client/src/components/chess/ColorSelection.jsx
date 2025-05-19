import { memo } from 'react';

const COLOR_OPTIONS = [
  {
    id: 'white',
    label: 'Play as White',
    icon: '♔',
    bgColor: 'bg-white',
    textColor: 'text-black',
    hoverColor: 'hover:bg-gray-200',
    border: ''
  },
  {
    id: 'black',
    label: 'Play as Black',
    icon: '♚',
    bgColor: 'bg-zinc-800',
    textColor: 'text-white',
    hoverColor: 'hover:bg-zinc-700',
    border: 'border border-zinc-600'
  }
];

const ColorSelection = ({ onSelectColor }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-800 rounded-xl p-8 max-w-md w-full shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Choose Your Color
      </h2>
      <div className="grid grid-cols-2 gap-6">
        {COLOR_OPTIONS.map(({ id, label, icon, bgColor, textColor, hoverColor, border }) => (
          <button
            key={id}
            onClick={() => onSelectColor(id)}
            className={`${bgColor} ${textColor} font-bold py-4 px-6 rounded-lg ${hoverColor} ${border} transition-colors flex flex-col items-center`}
            aria-label={label}
          >
            <span className="text-4xl mb-2" aria-hidden="true">
              {icon}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default memo(ColorSelection);
