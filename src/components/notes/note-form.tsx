'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
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
import { Button } from '@/components/ui/button';
import { Editor } from '@/components/editor/editor';

const noteSchema = z.object({
  title: z.string().optional(),
  content: z.any(),
});

interface NoteFormProps {
  projectId: string;
  noteId?: string; // Optional for new notes
  onClose: () => void;
}

export const NoteForm = ({ projectId, noteId, onClose }: NoteFormProps) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: null,
    },
  });

  const onSubmit = async (data: z.infer<typeof noteSchema>) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      if (noteId) {
        // Update existing note
        await db
          .update(notes)
          .set({ 
            title: data.title || null,
            content: data.content || null,
            updatedAt: new Date()
          })
          .where(eq(notes.id, noteId));
      } else {
        // Create new note
        await db.insert(notes).values({
          id: uuidv4(),
          projectId,
          title: data.title || null,
          content: data.content || null,
        });
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
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
              <FormLabel>Note Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter note title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Editor 
                  content={field.value} 
                  onChange={field.onChange} 
                  noteId={noteId}
                  projectId={projectId}
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
            {isLoading ? (noteId ? 'Saving...' : 'Create Note') : (noteId ? 'Save Note' : 'Create Note')}
          </Button>
        </div>
      </form>
    </Form>
  );
};