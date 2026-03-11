"use client";

import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DashboardRenderer({ data }: { data: any }) {
  if (!data || data.chart_type === "none" || !data.data || data.data.length === 0) {
    return (
      <div className="text-center text-neutral-500 max-w-md bg-neutral-900/40 p-10 rounded-3xl border border-neutral-800">
        <h3 className="text-xl text-neutral-300 font-medium mb-2">No Visualization Available</h3>
        <p className="text-sm">
          {data?.explanation || "The assistant couldn't generate a chart for this query."}
        </p>
      </div>
    );
  }

  const { chart_type, data: chartData, explanation } = data;

  // Extract keys dynamically
  const keys = Object.keys(chartData[0] || {});
  
  // Try to find a reasonable X-axis candidate (e.g., date, string categories)
  const xAxisKey = keys.find(k => 
    k.toLowerCase().includes('date') || 
    k.toLowerCase().includes('name') || 
    k.toLowerCase().includes('category') || 
    k.toLowerCase().includes('region') ||
    isNaN(Number(chartData[0][k]))
  ) || keys[0];

  // The rest are Y-axis numeric candidates
  const dataKeys = keys.filter(k => k !== xAxisKey);

  const renderChart = () => {
    switch (chart_type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey={xAxisKey} stroke="#888" tick={{fill: '#888'}} />
              <YAxis stroke="#888" tick={{fill: '#888'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', color: '#fff' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }}/>
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey={xAxisKey} stroke="#888" tick={{fill: '#888'}} />
              <YAxis stroke="#888" tick={{fill: '#888'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', color: '#fff' }} 
              />
              <Legend />
              {dataKeys.map((key, i) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[i % COLORS.length]} 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={dataKeys[0]}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={80} // Donut style
                fill="#8884d8"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', color: '#fff' }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'table':
      default:
        return (
          <div className="overflow-x-auto w-full max-h-[400px]">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="text-xs uppercase bg-neutral-800 text-neutral-400 sticky top-0">
                <tr>
                  {keys.map(k => (
                    <th key={k} className="px-6 py-3 font-medium">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {chartData.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    {keys.map(k => (
                      <td key={k} className="px-6 py-4">{String(row[k])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      {/* Chart Card */}
      <div className="w-full bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 shadow-2xl backdrop-blur-sm mb-6">
        {renderChart()}
      </div>

      {/* AI Explanation Card */}
      {explanation && (
        <div className="w-full text-center bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl">
          <p className="text-blue-100/90 text-lg font-light leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
