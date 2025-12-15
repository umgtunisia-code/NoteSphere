'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { tasks, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PencilIcon, ArrowLeftIcon, CalendarIcon } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueAt: Date;
  isCompleted: boolean | null;
  projectId: string;
  projectName: string;
  projectColor: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export default function TaskDetailPage() {
  const { id: taskId } = useParams<{ id: string }>();
  const { user } = useUser();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !taskId) return;

    const fetchTask = async () => {
      try {
        const taskResult = await db
          .select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            dueAt: tasks.dueAt,
            isCompleted: tasks.isCompleted,
            projectId: tasks.projectId,
            projectName: projects.name,
            projectColor: projects.color,
            createdAt: tasks.createdAt,
            updatedAt: tasks.updatedAt,
          })
          .from(tasks)
          .innerJoin(projects, eq(tasks.projectId, projects.id))
          .where(eq(tasks.id, taskId))
          .limit(1);

        if (taskResult.length > 0) {
          setTask(taskResult[0]);
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [user, taskId]);

  const toggleTaskCompletion = async () => {
    if (!user || !task) return;

    try {
      const newStatus = !(task.isCompleted ?? false);

      await db
        .update(tasks)
        .set({ isCompleted: newStatus })
        .where(eq(tasks.id, task.id));

      // Update local state
      setTask({
        ...task,
        isCompleted: newStatus
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading task...</div>;
  }

  if (!task) {
    return <div className="container mx-auto py-8 px-4">Task not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/projects/${task.projectId}`} className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Project
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={!!task.isCompleted}
                onCheckedChange={toggleTaskCompletion}
                className="mt-0.5"
              />
              <h1 className={`text-3xl font-bold ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h1>
            </div>
            
            <div className="flex items-center mt-3 space-x-3">
              <Link href={`/projects/${task.projectId}`}>
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: `${task.projectColor || '#3B82F6'}20`, color: task.projectColor || '#3B82F6' }}
                  className="text-xs cursor-pointer"
                >
                  {task.projectName}
                </Badge>
              </Link>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Due: {format(new Date(task.dueAt), 'MMM d, yyyy h:mm a')}
              </div>
              
              <span className="text-sm text-muted-foreground">
                Created: {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {/* Task editing functionality would go here */}
            <Button variant="outline">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          {task.description ? (
            <p className="whitespace-pre-wrap">{task.description}</p>
          ) : (
            <p className="text-muted-foreground">No description provided.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}