const COLOR_OPTIONS = [
  {
    id: "white",
    label: "Play as White",
    icon: "♔",
    bgColor: "bg-white",
    textColor: "text-black",
    hoverColor: "hover:bg-gray-200",
    border: "",
  },
  {
    id: "black",
    label: "Play as Black",
    icon: "♚",
    bgColor: "bg-zinc-800",
    textColor: "text-white",
    hoverColor: "hover:bg-zinc-700",
    border: "border border-zinc-600",
  },
];

const ColorSelection = ({ onSelectColor }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Choose Your Color
      </h2>
      <div className="grid grid-cols-2 gap-6">
        {COLOR_OPTIONS.map(
          ({ id, label, icon, bgColor, textColor, hoverColor, border }) => (
            <button
              key={id}
              onClick={() => onSelectColor(id)}
              className={`${bgColor} ${textColor} ${hoverColor} ${border} btn flex-col items-center`}
              aria-label={label}
            >
              <span className="text-4xl mb-2" aria-hidden="true">
                {icon}
              </span>
              <span>{label}</span>
            </button>
          )
        )}
      </div>
    </div>
  </div>
);

export default ColorSelection;
