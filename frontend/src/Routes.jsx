import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

// Pages
import LandingPage from "./pages/landing-page";
import LoginRegister from "./pages/login-register";
import DashboardOverview from "./pages/dashboard-overview";
import ProjectManagement from "./pages/project-management";
import KanbanBoard from "./pages/kanban-board";
import SprintPlanning from "./pages/sprint-planning";
import SprintManagement from "./pages/sprint-management";
import AnalyticsDashboard from "./pages/analytics-dashboard";
import TeamManagement from "./pages/team-management";
import TaskDetail from "./pages/task-detail";
import ProfilePage from "./pages/profile";
import NotFound from "./pages/NotFound";

const Routes = () => {
  return (
    <RouterRoutes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginRegister />} />
      <Route path="/register" element={<LoginRegister />} />
      <Route path="/login-register" element={<LoginRegister />} />

      {/* Authenticated Workspace Pages */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard-overview" element={<DashboardOverview />} />
        <Route path="/project-management" element={<ProjectManagement />} />
        <Route path="/kanban-board" element={<KanbanBoard />} />
        <Route path="/sprint-planning" element={<SprintPlanning />} />
        <Route path="/sprint-management" element={<SprintManagement />} />
        <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
        <Route path="/team-management" element={<TeamManagement />} />
        <Route path="/task-detail" element={<TaskDetail />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default Routes;
