import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AgentDetail from "./pages/AgentDetail";
import ChatDetail from "./pages/ChatDetail";
import ReviewsQueue from "./pages/ReviewsQueue";
import Configurations from "./pages/Configurations";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents/:agentId" element={<AgentDetail />} />
          <Route path="/chats/:chatId" element={<ChatDetail />} />
          <Route path="/reviews" element={<ReviewsQueue />} />
          <Route path="/configurations" element={<Configurations />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
