export default function Badge({ tone, label }) {
  const tones = {
    brand:
      "bg-[#f05742]/10 text-[#f05742] border-[#f05742]/30 ring-[#f05742]/20 hover:bg-[#f05742]/20 hover:ring-[#f05742]/30",
    success:
      "bg-green-100 text-green-700 border-green-300 ring-green-200 hover:bg-green-200 hover:ring-green-300",
    warning:
      "bg-yellow-100 text-yellow-700 border-yellow-300 ring-yellow-200 hover:bg-yellow-200 hover:ring-yellow-300",
    danger:
      "bg-red-100 text-red-700 border-red-300 ring-red-200 hover:bg-red-200 hover:ring-red-300",
    info: "bg-blue-100 text-blue-700 border-blue-300 ring-blue-200 hover:bg-blue-200 hover:ring-blue-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold ring-2 transition-all duration-200 hover:scale-105 cursor-default ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
