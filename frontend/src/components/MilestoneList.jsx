import { Target, Calendar } from "lucide-react";

const milestones = [
  {
    title: "Discovery workshop",
    project: "Orion CRM Revamp",
    due: "Feb 20, 2026",
  },
  {
    title: "Mobile UI kit approval",
    project: "Atlas Mobile App",
    due: "Feb 23, 2026",
  },
  {
    title: "Integrations QA",
    project: "Crest Retail POS",
    due: "Feb 26, 2026",
  },
];

export default function MilestoneList() {
  return (
    <div className="space-y-3">
      {milestones.map((item, index) => (
        <div
          key={index}
          className="group flex items-start justify-between gap-4 rounded-2xl bg-gradient-to-br from-[#f05742]/5 via-white to-white p-4 border-2 border-[#f05742]/20 transition-all duration-200 hover:shadow-lg hover:border-[#f05742]/40 hover:-translate-y-0.5 hover:from-[#f05742]/10"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#f05742]/10 text-[#f05742] ring-2 ring-[#f05742]/20 transition-all group-hover:scale-110 group-hover:ring-4">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 group-hover:text-[#f05742] transition-colors">
                {item.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                {item.project}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#f05742] whitespace-nowrap">
            <Calendar className="h-3 w-3" />
            <span>{item.due}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
