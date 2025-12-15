'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { notes, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PencilIcon, ArrowLeftIcon } from 'lucide-react';
import { Editor } from '@/components/editor/editor';
import Link from 'next/link';

interface Note {
  id: string;
  title: string | null;
  content: any;
  createdAt: Date | null;
  updatedAt: Date | null;
  projectId: string;
  projectName: string;
  projectColor: string | null;
}

export default function NoteDetailPage() {
  const { id: noteId } = useParams<{ id: string }>();
  const { user } = useUser();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<any>(null);

  useEffect(() => {
    if (!user || !noteId) return;

    const fetchNote = async () => {
      try {
        const noteResult = await db
          .select({
            id: notes.id,
            title: notes.title,
            content: notes.content,
            createdAt: notes.createdAt,
            updatedAt: notes.updatedAt,
            projectId: notes.projectId,
            projectName: projects.name,
            projectColor: projects.color,
          })
          .from(notes)
          .innerJoin(projects, eq(notes.projectId, projects.id))
          .where(eq(notes.id, noteId))
          .limit(1);

        if (noteResult.length > 0) {
          const noteData = noteResult[0];
          setNote(noteData);
          setEditContent(noteData.content);
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [user, noteId]);

  const handleSave = async () => {
    if (!user || !noteId || !editContent) return;

    try {
      await db
        .update(notes)
        .set({ 
          content: editContent,
          updatedAt: new Date()
        })
        .where(eq(notes.id, noteId));

      // Update local state
      if (note) {
        setNote({
          ...note,
          content: editContent,
          updatedAt: new Date()
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading note...</div>;
  }

  if (!note) {
    return <div className="container mx-auto py-8 px-4">Note not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/projects/${note.projectId}`} className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Project
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {note.title || 'Untitled Note'}
            </h1>
            <div className="flex items-center mt-2">
              <Link href={`/projects/${note.projectId}`}>
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: `${note.projectColor || '#3B82F6'}20`, color: note.projectColor || '#3B82F6' }}
                  className="text-xs cursor-pointer"
                >
                  {note.projectName}
                </Badge>
              </Link>
              <span className="text-sm text-muted-foreground ml-2">
                Last updated: {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setEditContent(note.content);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Note Content</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Editor 
              content={editContent} 
              onChange={setEditContent} 
            />
          ) : (
            <div className="prose max-w-none">
              {note.content && note.content.content ? (
                JSON.stringify(note.content) // In a real implementation, we'd render the Tiptap content properly
              ) : (
                <p className="text-muted-foreground">This note is empty.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}