'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { tasks, projects } from '@/lib/db/schema';
import { eq, gte, lte, and } from 'drizzle-orm';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, addDays } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  dueAt: Date;
  isCompleted: boolean;
  projectId: string;
  projectName: string;
  projectColor: string;
}

export default function CalendarPage() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        // Get tasks for the current month
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);

        const userTasks = await db
          .select({
            id: tasks.id,
            title: tasks.title,
            dueAt: tasks.dueAt,
            isCompleted: tasks.isCompleted,
            projectId: tasks.projectId,
            projectName: projects.name,
            projectColor: projects.color,
          })
          .from(tasks)
          .innerJoin(projects, eq(tasks.projectId, projects.id))
          .where(
            and(
              eq(tasks.userId, user.id),
              gte(tasks.dueAt, start),
              lte(tasks.dueAt, end)
            )
          );

        setTasks(userTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [user, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEE';
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-sm p-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;

        // Get tasks for this day
        const dayTasks = tasks.filter(task =>
          isSameDay(new Date(task.dueAt), cloneDay)
        );

        days.push(
          <div
            key={day.toString()}
            className={`min-h-24 border p-1 ${
              !isSameMonth(cloneDay, monthStart) ? 'bg-gray-100 text-gray-400' : ''
            } ${isSameDay(cloneDay, new Date()) ? 'bg-blue-50' : ''}`}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className="text-right text-sm p-1">
              {formattedDate}
            </div>
            <div className="p-1 space-y-1 max-h-20 overflow-y-auto">
              {dayTasks.map(task => (
                <div
                  key={task.id}
                  className={`text-xs p-1 rounded truncate ${
                    task.isCompleted
                      ? 'bg-gray-200 text-gray-500 line-through'
                      : `border-l-2 pl-2`
                  }`}
                  style={{
                    borderLeftColor: task.projectColor,
                    backgroundColor: `${task.projectColor}20`
                  }}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  const getSelectedDateTasks = () => {
    if (!selectedDate) return [];

    return tasks.filter(task =>
      isSameDay(new Date(task.dueAt), selectedDate)
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button>
          <CalendarIcon className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              {renderHeader()}
            </CardHeader>
            <CardContent>
              {renderDays()}
              {renderCells()}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                getSelectedDateTasks().length > 0 ? (
                  <div className="space-y-3">
                    {getSelectedDateTasks().map(task => (
                      <div
                        key={task.id}
                        className={`p-3 rounded border-l-4 ${
                          task.isCompleted
                            ? 'bg-gray-100 text-gray-500 line-through'
                            : 'bg-white'
                        }`}
                        style={{ borderLeftColor: task.projectColor }}
                      >
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge
                            variant="secondary"
                            style={{ backgroundColor: `${task.projectColor}20`, color: task.projectColor }}
                            className="text-xs"
                          >
                            {task.projectName}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tasks for this date.</p>
                )
              ) : (
                <p className="text-muted-foreground">Select a date to see tasks.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}