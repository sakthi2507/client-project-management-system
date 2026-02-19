export default function InfoTile({ label, value, helper, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 via-white to-gray-50 p-5 border-2 border-gray-100 transition-all duration-200 hover:shadow-xl hover:border-gray-200 hover:-translate-y-0.5">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-br from-[#f05742]/20 via-transparent to-transparent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 -z-10" />

      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f05742]/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f05742]/10 text-[#f05742] transition-all group-hover:scale-110 group-hover:rotate-12">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <p className="text-4xl font-black text-gray-900 tracking-tight group-hover:text-[#f05742] transition-colors">
          {value}
        </p>
        <p className="mt-3 text-xs font-semibold text-gray-500">{helper}</p>
      </div>
    </div>
  );
}
