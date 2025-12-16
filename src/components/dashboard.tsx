'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ProjectList } from '@/components/projects/project-list';
import { TaskList } from '@/components/tasks/task-list';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { ProjectForm } from '@/components/projects/project-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const Dashboard = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [showProjectModal, setShowProjectModal] = useState(false);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to continue.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onClose={() => setShowProjectModal(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TaskList />
        </div>
        <div>
          <ProjectList />
        </div>
      </div>
    </div>
  );
};