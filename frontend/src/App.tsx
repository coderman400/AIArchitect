import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Apps from "./pages/Apps";
import Flows from "./pages/Flows";
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
        </Routes>
      </div>
    </Router>
  );
}
