import Badge from "./Badge";

const projects = [
  {
    name: "Orion CRM Revamp",
    client: "Wayfinder Labs",
    owner: "A. Kumar",
    status: "On Track",
    budget: "$128,400",
    due: "Mar 28, 2026",
  },
  {
    name: "Atlas Mobile App",
    client: "NovaTech",
    owner: "S. Patel",
    status: "At Risk",
    budget: "$74,900",
    due: "Apr 05, 2026",
  },
  {
    name: "Crest Retail POS",
    client: "Crestline",
    owner: "M. Reddy",
    status: "Delayed",
    budget: "$56,200",
    due: "Apr 18, 2026",
  },
  {
    name: "Pulse Analytics",
    client: "Ignite Health",
    owner: "J. Chen",
    status: "On Track",
    budget: "$212,000",
    due: "May 02, 2026",
  },
];

export default function ProjectTable() {
  const statusTone = {
    "On Track": "success",
    "At Risk": "warning",
    Delayed: "danger",
  };

  return (
    <div className="overflow-hidden rounded-xl border-2 border-gray-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-600\">
                Project
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-600">
                Client
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-600">
                Owner
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-600">
                Status
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-600">
                Budget
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-600">
                Due
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {projects.map((project, index) => (
              <tr
                key={index}
                className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-[#f05742]/5 hover:via-[#f05742]/5 hover:to-transparent hover:shadow-sm"
              >
                <td className="px-5 py-4">
                  <p className="font-black text-gray-900 group-hover:text-[#f05742] transition-colors">
                    {project.name}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-gray-600">
                  {project.client}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-gray-600">
                  {project.owner}
                </td>
                <td className="px-5 py-4">
                  <Badge
                    tone={statusTone[project.status]}
                    label={project.status}
                  />
                </td>
                <td className="px-5 py-4 text-sm font-bold text-gray-900">
                  {project.budget}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-gray-600">
                  {project.due}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
