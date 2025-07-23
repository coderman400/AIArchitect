import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Apps from "./pages/Apps";
import Flows from "./pages/Flows";
import FlowDashboard from "./pages/FlowDashboard";
import FlowEdit from "./pages/FlowEdit";
import NewFlow from "./pages/NewFlow";
import TextInputForm from "./pages/TextInputForm";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/apps" replace />} />
          <Route path="/apps/*" element={<Apps />} />
          <Route path="/apps/new-flow" element={<NewFlow />} />
          <Route path="/apps/text-input" element={<TextInputForm />} />
          <Route path="/apps/flows" element={<Flows />} />
          <Route path="/apps/flows/:projectId" element={<FlowDashboard />} />
          <Route path="/apps/flows/:projectId/edit" element={<FlowEdit />} />
        </Routes>
      </div>
    </Router>
  );
}
