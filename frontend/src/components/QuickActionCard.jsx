import { ArrowRight } from "lucide-react";

export default function QuickActionCard({
  title,
  description,
  cta,
  icon: Icon,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 via-white to-gray-50 p-5 border-2 border-gray-100 transition-all duration-200 hover:shadow-xl hover:border-[#f05742]/40 hover:from-[#f05742]/5 hover:-translate-y-1">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-br from-[#f05742]/20 via-transparent to-transparent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 -z-10" />

      {/* Icon */}
      {Icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f05742]/10 text-[#f05742] ring-2 ring-[#f05742]/20 transition-all duration-200 group-hover:scale-110 group-hover:ring-4 group-hover:shadow-lg">
          <Icon className="h-5 w-5" />
        </div>
      )}

      {/* Content */}
      <p className="text-sm font-black text-gray-900 group-hover:text-[#f05742] transition-colors">
        {title}
      </p>
      <p className="mt-2 text-xs font-semibold text-gray-500 leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white border-2 border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-all duration-200 hover:border-[#f05742]/40 hover:text-[#f05742] hover:bg-[#f05742]/5 hover:shadow-md group-hover:-translate-y-0.5">
        <span>{cta}</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
