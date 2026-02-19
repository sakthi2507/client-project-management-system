export default function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          {action && <div>{action}</div>}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}
