import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Plus,
  Workflow,
  DollarSign,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Apps: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-48">
        <Routes>
          <Route path="/" element={<AppsHome />} />
        </Routes>
      </main>
    </div>
  );
};

const AppsHome: React.FC = () => {
  const totalFlows = 3;
  const costBenefit = "$12,450";
  const flows = [
    { id: 1, name: "Customer Onboarding", status: "Active" },
    { id: 2, name: "Invoice Processing", status: "Active" },
    { id: 3, name: "Data Analysis", status: "Draft" },
  ];

  // Mock analytics data
  const monthlyLLMCalls = 15420;
  const monthlyCost = "$284.50";

  // Mock chart data for the last 30 days
  const chartData = [
    { date: "Jan 1", calls: 400, cost: 12.5 },
    { date: "Jan 3", calls: 380, cost: 11.8 },
    { date: "Jan 5", calls: 450, cost: 14.2 },
    { date: "Jan 7", calls: 520, cost: 16.8 },
    { date: "Jan 9", calls: 480, cost: 15.1 },
    { date: "Jan 11", calls: 700, cost: 19.5 },
    { date: "Jan 13", calls: 550, cost: 17.8 },
    { date: "Jan 15", calls: 620, cost: 20.2 },
    { date: "Jan 17", calls: 580, cost: 18.9 },
    { date: "Jan 19", calls: 650, cost: 21.8 },
    { date: "Jan 21", calls: 700, cost: 23.5 },
    { date: "Jan 23", calls: 680, cost: 22.1 },
    { date: "Jan 25", calls: 720, cost: 24.8 },
    { date: "Jan 27", calls: 750, cost: 26.2 },
    { date: "Jan 29", calls: 680, cost: 22.9 },
    { date: "Jan 31", calls: 800, cost: 28.5 },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Welcome to AI Architect</h2>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Total Flows
                </h3>
                <p className="text-3xl font-bold mt-2">{totalFlows}</p>
              </div>
              <Workflow className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Overall Cost Benefit
                </h3>
                <p className="text-3xl font-bold mt-2 text-green-700">
                  {costBenefit}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-700" />
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-muted-foreground">
                  Monthly LLM Calls
                </h4>
                <p className="text-3xl font-bold mt-2">
                  {monthlyLLMCalls.toLocaleString()}
                </p>
                <p className="text-sm text-green-700 mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last month
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-700" />
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-muted-foreground">
                  Monthly Cost
                </h4>
                <p className="text-3xl font-bold mt-2">{monthlyCost}</p>
                <p className="text-sm text-red-700 mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-700" />
            </div>
          </div>
        </div>

        {/* My Flows Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">My Flows</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Flow Card */}
            <Link to="/apps/new-flow">
              <div className="bg-card rounded-lg p-6 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer group">
                <div className="flex flex-col items-center justify-center h-32">
                  <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                  <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    Add New Flow
                  </h4>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Create a new workflow
                  </p>
                </div>
              </div>
            </Link>

            {/* Existing Flows */}
            {flows.map((flow) => (
              <div
                key={flow.id}
                className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-semibold">{flow.name}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      flow.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {flow.status}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Flow {flow.id} - Click to view details
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div>
          <h3 className="text-2xl font-bold mb-6">Usage Trends</h3>

          {/* Chart */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold">
                LLM Usage & Pricing Trends
              </h4>
              <div className="flex gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  API Calls
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Cost ($)
                </span>
              </div>
            </div>

            {/* Actual Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    className="text-sm"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="calls"
                    orientation="left"
                    className="text-sm"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="cost"
                    orientation="right"
                    className="text-sm"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="calls"
                    type="monotone"
                    dataKey="calls"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    name="API Calls"
                  />
                  <Line
                    yAxisId="cost"
                    type="monotone"
                    dataKey="cost"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    name="Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Footer */}
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Last 30 days • Updated in real-time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apps;
