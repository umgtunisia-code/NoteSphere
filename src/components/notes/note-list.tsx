'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { notes, projects } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon } from 'lucide-react';

interface Props {
  projectId: string;
}

interface Note {
  id: string;
  title: string | null;
  content: any;
  createdAt: Date;
  updatedAt: Date;
}

export const NoteList = ({ projectId }: Props) => {
  const { user } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) return;

    const fetchNotes = async () => {
      try {
        const userNotes = await db
          .select()
          .from(notes)
          .where(eq(notes.projectId, projectId))
          .orderBy(desc(notes.updatedAt));

        setNotes(userNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user, projectId]);

  if (loading) {
    return <div>Loading notes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-muted-foreground">No notes yet. Create your first note!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {note.title || 'Untitled Note'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <EditIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};