import { CheckCircle, Clock } from "lucide-react";

const activities = [
  {
    title: "Crest Retail POS scope approved",
    time: "18 min ago",
    owner: "R. Iyer",
  },
  {
    title: "Atlas Mobile App sprint 6 kicked off",
    time: "1 hour ago",
    owner: "S. Patel",
  },
  {
    title: "Orion CRM Revamp invoice sent",
    time: "3 hours ago",
    owner: "A. Kumar",
  },
  {
    title: "Pulse Analytics phase 2 planning",
    time: "5 hours ago",
    owner: "J. Chen",
  },
];

export default function ActivityFeed() {
  return (
    <div className="space-y-3">
      {activities.map((item, index) => (
        <div
          key={index}
          className="group flex items-start justify-between gap-4 rounded-2xl bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 border-2 border-gray-100 transition-all duration-200 hover:shadow-lg hover:border-gray-200 hover:from-[#f05742]/5 hover:-translate-y-0.5"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 ring-2 ring-green-200 transition-all group-hover:scale-110 group-hover:ring-4">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 group-hover:text-[#f05742] transition-colors">
                {item.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                By {item.owner}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-400 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            <span>{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
