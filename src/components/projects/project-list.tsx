'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { projects, tasks } from '@/lib/db/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface ProjectWithStats extends Project {
  totalTasks: number;
  completedTasks: number;
}

export const ProjectList = () => {
  const { user } = useUser();
  const [projectsWithStats, setProjectsWithStats] = useState<ProjectWithStats[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        // Get all projects for the user
        const userProjects = await db
          .select()
          .from(projects)
          .where(eq(projects.userId, user.id))
          .orderBy(desc(projects.createdAt));

        // Calculate stats for each project
        const projectsWithStatsData = await Promise.all(
          userProjects.map(async (project) => {
            // Get total tasks count
            const totalTasksResult = await db
              .select({ count: { count: tasks.id } })
              .from(tasks)
              .where(eq(tasks.projectId, project.id));
            
            const totalTasks = Number(totalTasksResult[0]?.count || 0);

            // Get completed tasks count
            const completedTasksResult = await db
              .select({ count: { count: tasks.id } })
              .from(tasks)
              .where(and(
                eq(tasks.projectId, project.id),
                eq(tasks.isCompleted, true)
              ));
            
            const completedTasks = Number(completedTasksResult[0]?.count || 0);

            return {
              id: project.id,
              name: project.name,
              color: project.color || '#3B82F6',
              createdAt: project.createdAt,
              totalTasks,
              completedTasks,
            };
          })
        );

        setProjectsWithStats(projectsWithStatsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projectsWithStats.map((project) => {
            const progress = project.totalTasks > 0 
              ? Math.round((project.completedTasks / project.totalTasks) * 100) 
              : 0;
            
            return (
              <div key={project.id} className="pb-4 last:pb-0 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{project.name}</h3>
                  <Badge 
                    variant="secondary" 
                    style={{ backgroundColor: `${project.color}20`, color: project.color }}
                    className="text-xs"
                  >
                    {project.completedTasks}/{project.totalTasks} tasks
                  </Badge>
                </div>
                
                {project.totalTasks > 0 && (
                  <div className="mt-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {progress}% complete
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          
          {projectsWithStats.length === 0 && (
            <p className="text-muted-foreground text-sm">No projects yet. Create your first project!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};