'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { tasks, projects } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  projectId: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueAt: Date;
  isCompleted: boolean | null;
  projectId: string;
  projectName: string;
  projectColor: string | null;
}

export const TaskListByProject = ({ projectId }: Props) => {
  const { user } = useUser();
  const [projectTasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) return;

    const fetchTasks = async () => {
      try {
        // Get tasks for the project
        const fetchedTasks = await db
          .select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            dueAt: tasks.dueAt,
            isCompleted: tasks.isCompleted,
            projectId: tasks.projectId,
            projectName: projects.name,
            projectColor: projects.color,
          })
          .from(tasks)
          .innerJoin(projects, eq(tasks.projectId, projects.id))
          .where(eq(tasks.projectId, projectId))
          .orderBy(desc(tasks.dueAt));

        setTasks(fetchedTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, projectId]);

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;

    try {
      // Update the task completion status
      await db
        .update(tasks)
        .set({ isCompleted: !currentStatus })
        .where(eq(tasks.id, taskId));

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, isCompleted: !currentStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {projectTasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks in this project yet.</p>
        ) : (
          <div className="space-y-4">
            {projectTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  checked={!!task.isCompleted}
                  onCheckedChange={() => toggleTaskCompletion(task.id, !!task.isCompleted)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className={`${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: `${task.projectColor || '#3B82F6'}20`, color: task.projectColor || '#3B82F6' }}
                      className="text-xs"
                    >
                      {task.projectName}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className={`text-sm mt-1 ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                      {task.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Due: {format(new Date(task.dueAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};