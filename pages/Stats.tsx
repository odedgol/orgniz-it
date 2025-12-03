import React from 'react';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Card } from '../components/ui/Components';

const Stats = () => {
  const { tasks, jobs, subjects, user } = useStore();

  // Calculate Mock Data for Charts
  const activityData = [
    { day: 'Mon', tasks: 4 },
    { day: 'Tue', tasks: 6 },
    { day: 'Wed', tasks: 2 }, // Today (mock)
    { day: 'Thu', tasks: 0 },
    { day: 'Fri', tasks: 0 },
    { day: 'Sat', tasks: 0 },
    { day: 'Sun', tasks: 0 },
  ];

  const subjectData = subjects.map(s => ({
    name: s.name,
    value: tasks.filter(t => t.subjectId === s.id && t.completed).length,
    color: s.color
  })).filter(d => d.value > 0);

  const pipelineData = [
    { name: 'Wishlist', value: jobs.filter(j => j.status === 'wishlist').length },
    { name: 'Applied', value: jobs.filter(j => j.status === 'applied').length },
    { name: 'Screening', value: jobs.filter(j => j.status === 'screening').length },
    { name: 'Interview', value: jobs.filter(j => j.status === 'interview').length },
    { name: 'Offer', value: jobs.filter(j => j.status === 'offer').length },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#FAFAFA]">Weekly Insights</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Activity Chart */}
        <Card className="p-6">
            <h3 className="text-sm font-semibold mb-6 text-[#A1A1A6] uppercase tracking-wider">Task Activity</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                        <XAxis dataKey="day" stroke="#4A4A4F" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1C1C1F', borderColor: '#2A2A30', borderRadius: '8px', color: '#FAFAFA' }}
                            itemStyle={{ color: '#FAFAFA' }}
                            cursor={{ fill: '#2A2A30' }}
                        />
                        <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                            {activityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.day === 'Wed' ? '#5E6AD2' : '#2A2A30'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>

        {/* Subject Breakdown */}
        <Card className="p-6">
             <h3 className="text-sm font-semibold mb-6 text-[#A1A1A6] uppercase tracking-wider">Focus Areas</h3>
             <div className="flex items-center">
                 <div className="h-64 w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={subjectData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {subjectData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-1/2 space-y-3">
                    {subjectData.map(s => (
                        <div key={s.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                <span className="text-[#A1A1A6]">{s.name}</span>
                            </div>
                            <span className="font-bold">{s.value}</span>
                        </div>
                    ))}
                 </div>
             </div>
        </Card>

        {/* Pipeline Funnel - Visualized as simple bars for simplicity */}
        <Card className="col-span-2 p-6">
             <h3 className="text-sm font-semibold mb-6 text-[#A1A1A6] uppercase tracking-wider">Application Pipeline</h3>
             <div className="flex items-end justify-between px-12 gap-4 h-32">
                {pipelineData.map((stage, idx) => {
                    const height = stage.value === 0 ? 4 : stage.value * 20; // Simple scaling
                    return (
                        <div key={stage.name} className="flex-1 flex flex-col items-center gap-2 group">
                            <span className="text-xl font-bold text-[#FAFAFA] mb-1">{stage.value}</span>
                            <div 
                                className="w-full bg-[#2A2A30] rounded-t-lg transition-all group-hover:bg-[#5E6AD2]" 
                                style={{ height: `${height}%`, minHeight: '4px' }}
                            />
                            <span className="text-xs text-[#6B6B70] font-medium uppercase">{stage.name}</span>
                        </div>
                    )
                })}
             </div>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
