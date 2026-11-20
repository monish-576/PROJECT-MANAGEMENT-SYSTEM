import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import Routes from "./Routes";
import { UserProvider } from './context/UserContext';
import { ModalProvider } from './context/ModalContext';
import ProjectCreationModal from './components/modals/ProjectCreationModal';
import SprintCreationModal from './components/modals/SprintCreationModal';
import TaskCreationModal from './components/modals/TaskCreationModal';

function App() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleProjectCreated = (newProject) => {
    setIsProjectModalOpen(false);
    window.location.reload();
  };

  const handleSprintCreated = (newSprint) => {
    setIsSprintModalOpen(false);
    window.location.reload();
  };

  const handleTaskCreated = (newTask) => {
    setIsTaskModalOpen(false);
    window.location.reload();
  };

  return (
    <UserProvider>
      <ModalProvider
        value={{
          isProjectModalOpen,
          setIsProjectModalOpen,
          isSprintModalOpen,
          setIsSprintModalOpen,
          isTaskModalOpen,
          setIsTaskModalOpen,
          handleProjectCreated,
          handleSprintCreated,
          handleTaskCreated,
        }}
      >
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
            <Routes />
          </ErrorBoundary>
          <ProjectCreationModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            onProjectCreated={handleProjectCreated}
          />
          <SprintCreationModal
            isOpen={isSprintModalOpen}
            onClose={() => setIsSprintModalOpen(false)}
            onSprintCreated={handleSprintCreated}
          />
          <TaskCreationModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onTaskCreated={handleTaskCreated}
          />
        </BrowserRouter>
      </ModalProvider>
    </UserProvider>
  );
}

export default App;
