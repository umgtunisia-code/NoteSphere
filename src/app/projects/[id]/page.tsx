export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { projects, notes, tasks } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoteList } from '@/components/notes/note-list';
import { TaskListByProject } from '@/components/tasks/task-list-by-project';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NoteForm } from '@/components/notes/note-form';
import { TaskForm } from '@/components/tasks/task-form';

interface Project {
  id: string;
  name: string;
  color: string | null;
  createdAt: Date | null;
}

interface ProjectWithStats extends Project {
  totalTasks: number;
  completedTasks: number;
}

export default function ProjectDetailPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = useUser();
  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) return;

    const fetchProject = async () => {
      try {
        // Get project details
        const projectResult = await db
          .select()
          .from(projects)
          .where(eq(projects.id, projectId))
          .limit(1);

        if (projectResult.length === 0) {
          console.error('Project not found');
          setLoading(false);
          return;
        }

        const projectData = projectResult[0];

        // Get total tasks count
        const totalTasksResult = await db
          .select({ count: { count: tasks.id } })
          .from(tasks)
          .where(eq(tasks.projectId, projectData.id));
        
        const totalTasks = Number(totalTasksResult[0]?.count || 0);

        // Get completed tasks count
        const completedTasksResult = await db
          .select({ count: { count: tasks.id } })
          .from(tasks)
          .where(and(eq(tasks.projectId, projectData.id), eq(tasks.isCompleted, true)));
        
        const completedTasks = Number(completedTasksResult[0]?.count || 0);

        setProject({
          id: projectData.id,
          name: projectData.name,
          color: projectData.color || '#3B82F6',
          createdAt: projectData.createdAt,
          totalTasks,
          completedTasks,
        });
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [user, projectId]);

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading project...</div>;
  }

  if (!project) {
    return <div className="container mx-auto py-8 px-4">Project not found</div>;
  }

  const progress = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100) 
    : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: project.color || '#3B82F6' }}>
            {project.name}
          </h1>
          <div className="flex items-center mt-2">
            <Badge
              variant="secondary"
              style={{ backgroundColor: `${project.color || '#3B82F6'}20`, color: project.color || '#3B82F6' }}
              className="mr-2"
            >
              {project.completedTasks}/{project.totalTasks} tasks
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" /> New Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <NoteForm 
                projectId={projectId} 
                onClose={() => setShowNoteModal(false)} 
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm 
                projectId={projectId} 
                onClose={() => setShowTaskModal(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Project Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" style={{ '--progress-color': project.color || '#3B82F6' } as React.CSSProperties} />
      </div>
      
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="notes">
          <NoteList projectId={projectId} />
        </TabsContent>
        <TabsContent value="tasks">
          <TaskListByProject projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}