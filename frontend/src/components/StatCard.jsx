export default function StatCard({ title, value, change, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        {change && (
          <span className="text-xs font-medium text-green-600">{change}</span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}
