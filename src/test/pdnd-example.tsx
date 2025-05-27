// src/test/pdnd-example.tsx
import React, { useState } from 'react';
import { PdndSortableList, PdndContainer, PdndListItem } from '../utils/pdnd-components';
import { pdndUtils } from '../utils/pdnd-core';
import type { PdndData } from '../utils/pdnd-core';

// ============ TEST DATA ============
interface TaskData extends PdndData {
  type: 'task';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in-progress' | 'done';
}

interface ProjectData extends PdndData {
  type: 'project';
  name: string;
  description: string;
  tasks: number;
}

const initialTasks: TaskData[] = [
  { 
    id: 'task-1', 
    type: 'task', 
    title: 'Design Homepage Layout', 
    description: 'Create wireframes and mockups for the main landing page',
    priority: 'high',
    status: 'todo'
  },
  { 
    id: 'task-2', 
    type: 'task', 
    title: 'Fix Authentication Bug', 
    description: 'Resolve login issues with social media authentication',
    priority: 'critical',
    status: 'in-progress'
  },
  { 
    id: 'task-3', 
    type: 'task', 
    title: 'Write API Documentation', 
    description: 'Document all REST endpoints with examples',
    priority: 'medium',
    status: 'todo'
  },
  { 
    id: 'task-4', 
    type: 'task', 
    title: 'Optimize Database Queries', 
    description: 'Improve performance of user dashboard queries',
    priority: 'low',
    status: 'todo'
  },
  { 
    id: 'task-5', 
    type: 'task', 
    title: 'Setup CI/CD Pipeline', 
    description: 'Configure automated testing and deployment',
    priority: 'medium',
    status: 'done'
  },
];

const initialProjects: ProjectData[] = [
  {
    id: 'project-1',
    type: 'project',
    name: 'E-commerce Platform',
    description: 'Building a modern online shopping experience',
    tasks: 12,
  },
  {
    id: 'project-2',
    type: 'project',
    name: 'Mobile App',
    description: 'Cross-platform mobile application',
    tasks: 8,
  },
  {
    id: 'project-3',
    type: 'project',
    name: 'Analytics Dashboard',
    description: 'Real-time data visualization dashboard',
    tasks: 15,
  },
];

// ============ HELPER FUNCTIONS ============
const getPriorityColor = (priority: TaskData['priority']) => {
  switch (priority) {
    case 'critical': return 'text-red-600 bg-red-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-green-600 bg-green-100';
  }
};

const getStatusColor = (status: TaskData['status']) => {
  switch (status) {
    case 'todo': return 'text-gray-600 bg-gray-100';
    case 'in-progress': return 'text-blue-600 bg-blue-100';
    case 'done': return 'text-green-600 bg-green-100';
  }
};

// ============ MAIN COMPONENT ============
export const PdndExample: React.FC = () => {
  const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [completedTasks, setCompletedTasks] = useState<TaskData[]>([]);

  // Task management functions
  const addNewTask = () => {
    const newTask: TaskData = {
      id: `task-${Date.now()}`,
      type: 'task',
      title: `New Task ${tasks.length + 1}`,
      description: 'Add description here...',
      priority: 'medium',
      status: 'todo',
    };
    setTasks(prev => [...prev, newTask]);
  };

  const removeTask = (task: TaskData) => {
    setTasks(prev => prev.filter(t => t.id !== task.id));
    setCompletedTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const addNewProject = () => {
    const newProject: ProjectData = {
      id: `project-${Date.now()}`,
      type: 'project',
      name: `Project ${projects.length + 1}`,
      description: 'Add project description...',
      tasks: 0,
    };
    setProjects(prev => [...prev, newProject]);
  };

  const removeProject = (project: ProjectData) => {
    setProjects(prev => prev.filter(p => p.id !== project.id));
  };

  // Handle task completion
  const handleTaskComplete = (task: PdndData) => {
    if (task.type === 'task') {
      const taskData = task as TaskData;
      const updatedTask = { ...taskData, status: 'done' as const };
      
      setTasks(prev => prev.filter(t => t.id !== task.id));
      setCompletedTasks(prev => [...prev, updatedTask]);
      
      console.log('✅ Task completed:', updatedTask);
    }
  };

  // Reset all data
  const handleReset = () => {
    setTasks(initialTasks);
    setProjects(initialProjects);
    setCompletedTasks([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          🎯 Enhanced Drag & Drop System
        </h1>
        <p className="text-gray-600 mb-4 text-lg">
          Real-time reordering with drag handles, smooth animations, and intuitive UX
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Reset All
          </button>
          <div className="text-sm text-gray-500 self-center">
            Tasks: {tasks.length} • Projects: {projects.length} • Completed: {completedTasks.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Tasks Column */}
        <div className="space-y-6">
          <PdndSortableList
            items={tasks}
            onReorder={setTasks}
            title="📋 Task Backlog"
            onAddItem={addNewTask}
            onRemoveItem={removeTask}
            addButtonText="Add Task"
            emptyMessage="No tasks in backlog"
            className="bg-gray-50 p-4 rounded-lg"
            renderItem={(task, index) => (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-gray-800 text-lg">
                    {task.title}
                  </h4>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {task.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Position: {index + 1}</span>
                  <span>ID: {task.id.split('-')[1]}</span>
                </div>
              </div>
            )}
          />

          {/* Source Items for Cross-Container Drag */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              🎯 Drag to Complete
            </h3>
            <div className="space-y-2">
              {tasks.slice(0, 3).map(task => (
                <PdndListItem
                  key={`source-${task.id}`}
                  item={task}
                  onDragStart={(data) => console.log('🚀 Started dragging:', data.title)}
                  onDragEnd={(data) => console.log('🛬 Finished dragging:', data.title)}
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        Drag to completion zone →
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </PdndListItem>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Column */}
        <div>
          <PdndSortableList
            items={projects}
            onReorder={setProjects}
            title="🚀 Active Projects"
            onAddItem={addNewProject}
            onRemoveItem={removeProject}
            addButtonText="Add Project"
            emptyMessage="No active projects"
            className="bg-blue-50 p-4 rounded-lg"
            renderItem={(project, index) => (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      {project.name}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      {project.description}
                    </p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {project.tasks} tasks
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Priority: {index + 1}</span>
                  <span>ID: {project.id.split('-')[1]}</span>
                </div>
              </div>
            )}
          />
        </div>

        {/* Completion Zone */}
        <div className="space-y-6">
          <PdndContainer
            title="✅ Task Completion Zone"
            acceptedTypes={['task']}
            onItemDrop={handleTaskComplete}
            emptyMessage="Drop tasks here to mark as completed"
            canDrop={(data) => data.type === 'task'}
            className="bg-green-50 p-4 rounded-lg"
          >
            <div className="text-center text-green-600 font-medium">
              🎯 Drop Zone Active
            </div>
          </PdndContainer>

          {/* Completed Tasks Display */}
          {completedTasks.length > 0 && (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                🎉 Completed Tasks
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  {completedTasks.length}
                </span>
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {completedTasks.map(task => (
                  <div
                    key={`completed-${task.id}`}
                    className="p-3 bg-green-50 border border-green-200 rounded opacity-80"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 line-through">
                          {task.title}
                        </div>
                        <div className="text-sm text-green-600">
                          ✅ Completed
                        </div>
                      </div>
                      <button
                        onClick={() => removeTask(task)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove completed task"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simple Demo */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              🔥 Simple Demo
            </h3>
            <div className="space-y-4">
              <PdndListItem
                item={pdndUtils.createDragData('demo-1', 'demo', { 
                  text: 'Drag me around!',
                  color: 'purple' 
                })}
                onDragStart={(data) => console.log('Demo drag started:', data)}
                className="bg-gradient-to-r from-purple-400 to-pink-400 text-white"
              >
                <div className="text-center">
                  <div className="font-bold">✨ Magic Item</div>
                  <div className="text-sm opacity-90">Try dragging me!</div>
                </div>
              </PdndListItem>

              <PdndContainer
                acceptedTypes={['demo']}
                onItemDrop={(data) => {
                  alert(`🎉 You dropped: "${data.text}"`);
                }}
                emptyMessage="Drop the magic item here!"
                className="min-h-[100px]"
              >
                <div className="text-center text-purple-600">
                  🎯 Magic Drop Zone
                </div>
              </PdndContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">🚀 Features Demonstrated:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <strong>✋ Drag Handles:</strong> Only drag by the grip icon for better control
          </div>
          <div>
            <strong>🎯 Real-time Reordering:</strong> Instant visual feedback while dragging
          </div>
          <div>
            <strong>🎨 Smooth Animations:</strong> Enhanced UX with transitions and previews
          </div>
          <div>
            <strong>🔄 Cross-container:</strong> Drag items between different lists
          </div>
          <div>
            <strong>📊 Live Updates:</strong> Immediate state changes and console logging
          </div>
          <div>
            <strong>🎛️ Edge Detection:</strong> Smart positioning with top/bottom indicators
          </div>
        </div>
      </div>
    </div>
  );
};