'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { tasks, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueAt: z.date({ required_error: 'Due date is required' }),
  projectId: z.string().min(1, 'Project is required'),
  reminderOffsetMinutes: z.number().optional(),
});

interface TaskFormProps {
  projectId: string;
  onClose: () => void;
}

interface ProjectOption {
  id: string;
  name: string;
  color: string;
}

export const TaskForm = ({ projectId, onClose }: TaskFormProps) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [userProjects, setProjects] = useState<ProjectOption[]>([]);
  const [time, setTime] = useState<string>('09:00');

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        const fetchedProjects = await db
          .select()
          .from(projects)
          .where(eq(projects.userId, user.id));

        setProjects(fetchedProjects.map(p => ({
          id: p.id,
          name: p.name,
          color: p.color || '#3B82F6'
        })));
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [user]);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueAt: new Date(),
      projectId: projectId,
      reminderOffsetMinutes: 30,
    },
  });

  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const dueAt = new Date(data.dueAt);
      dueAt.setHours(hours, minutes, 0, 0);
      
      await db.insert(tasks).values({
        id: uuidv4(),
        userId: user.id,
        projectId: data.projectId,
        title: data.title,
        description: data.description || null,
        dueAt,
        reminderOffsetMinutes: data.reminderOffsetMinutes || null,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter task description (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {userProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <span className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Due Time</FormLabel>
            <div className="relative mt-2">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="reminderOffsetMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder (minutes before due time)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="30" 
                  value={field.value || ''} 
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
};