// src/test/pdnd-example.tsx
import React, { useState } from 'react';
import { PdndDraggable, PdndDropZone, PdndListItem, PdndContainer } from '../utils/pdnd-components';
import { pdndUtils } from '../utils/pdnd-core';
import type { PdndData } from '../utils/pdnd-core';

// ============ TEST DATA ============
const initialItems: PdndData[] = [
  { id: 'task-1', type: 'task', title: 'Design Homepage', priority: 'high' },
  { id: 'task-2', type: 'task', title: 'Fix Login Bug', priority: 'critical' },
  { id: 'task-3', type: 'task', title: 'Write Documentation', priority: 'low' },
  { id: 'file-1', type: 'file', name: 'report.pdf', size: '2MB' },
  { id: 'file-2', type: 'file', name: 'image.jpg', size: '500KB' },
];

// ============ TEST COMPONENT ============
export const PdndExample: React.FC = () => {
  const [availableItems, setAvailableItems] = useState(initialItems);
  const [taskBoard, setTaskBoard] = useState<PdndData[]>([]);
  const [fileStorage, setFileStorage] = useState<PdndData[]>([]);
  const [trashBin, setTrashBin] = useState<PdndData[]>([]);

  // Remove item from source lists
  const removeFromSource = (itemId: string) => {
    setAvailableItems(prev => prev.filter(item => item.id !== itemId));
    setTaskBoard(prev => prev.filter(item => item.id !== itemId));
    setFileStorage(prev => prev.filter(item => item.id !== itemId));
    setTrashBin(prev => prev.filter(item => item.id !== itemId));
  };

  // Handle drops to task board
  const handleTaskDrop = (data: PdndData) => {
    if (data.type === 'task') {
      removeFromSource(data.id);
      setTaskBoard(prev => [...prev, data]);
      console.log('✅ Task dropped to board:', data);
    }
  };

  // Handle drops to file storage
  const handleFileDrop = (data: PdndData) => {
    if (data.type === 'file') {
      removeFromSource(data.id);
      setFileStorage(prev => [...prev, data]);
      console.log('📁 File dropped to storage:', data);
    }
  };

  // Handle drops to trash
  const handleTrashDrop = (data: PdndData) => {
    removeFromSource(data.id);
    setTrashBin(prev => [...prev, data]);
    console.log('🗑️ Item moved to trash:', data);
  };

  // Reset all items
  const handleReset = () => {
    setAvailableItems(initialItems);
    setTaskBoard([]);
    setFileStorage([]);
    setTrashBin([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🎯 Pragmatic Drag & Drop Test
        </h1>
        <p className="text-gray-600 mb-4">
          Drag tasks to the task board, files to storage, or anything to trash!
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reset All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Items */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-3">📦 Available Items</h2>
            <div className="space-y-2">
              {availableItems.map(item => (
                <PdndListItem
                  key={item.id}
                  item={item}
                  onDragStart={(data) => console.log('🚀 Started dragging:', data)}
                  onDragEnd={(data) => console.log('🛬 Finished dragging:', data)}
                  className="hover:shadow-md"
                >
                  {item.type === 'task' ? (
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className={`text-sm ${
                        item.priority === 'critical' ? 'text-red-600' :
                        item.priority === 'high' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        Priority: {item.priority}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">📄 {item.name}</div>
                      <div className="text-sm text-gray-600">Size: {item.size}</div>
                    </div>
                  )}
                </PdndListItem>
              ))}
              {availableItems.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  All items have been moved. Click "Reset All Items" to restore.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drop Zones */}
        <div className="space-y-4">
          {/* Task Board */}
          <PdndContainer
            title="📋 Task Board (Tasks Only)"
            acceptedTypes={['task']}
            onItemDrop={handleTaskDrop}
            emptyMessage="Drop tasks here"
            canDrop={(data) => data.type === 'task'}
          >
            {taskBoard.map(task => (
              <div key={task.id} className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-blue-600">Priority: {task.priority}</div>
              </div>
            ))}
          </PdndContainer>

          {/* File Storage */}
          <PdndContainer
            title="💾 File Storage (Files Only)"
            acceptedTypes={['file']}
            onItemDrop={handleFileDrop}
            emptyMessage="Drop files here"
            canDrop={(data) => data.type === 'file'}
          >
            {fileStorage.map(file => (
              <div key={file.id} className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium">📄 {file.name}</div>
                <div className="text-sm text-green-600">Size: {file.size}</div>
              </div>
            ))}
          </PdndContainer>

          {/* Trash Bin */}
          <PdndContainer
            title="🗑️ Trash Bin (Accepts All)"
            acceptedTypes={['task', 'file']}
            onItemDrop={handleTrashDrop}
            emptyMessage="Drop anything here to delete"
            className="border-red-200"
          >
            {trashBin.map(item => (
              <div key={item.id} className="p-3 bg-red-50 border border-red-200 rounded opacity-60">
                <div className="font-medium line-through">
                  {item.type === 'task' ? item.title : `📄 ${item.name}`}
                </div>
                <div className="text-sm text-red-600">Deleted</div>
              </div>
            ))}
          </PdndContainer>
        </div>
      </div>

      {/* Simple Example */}
      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4">🔥 Simple Example</h2>
        <div className="flex gap-6">
          <PdndDraggable
            dragData={pdndUtils.createDragData('simple-1', 'demo', { text: 'Hello World!' })}
            className="p-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg"
          >
            <div className="text-center">
              <div className="text-lg font-bold">Drag Me!</div>
              <div className="text-sm opacity-90">Simple draggable item</div>
            </div>
          </PdndDraggable>

          <PdndDropZone
            acceptedTypes={['demo']}
            onItemDrop={(data) => alert(`Dropped: ${data.text}`)}
            className="flex-1"
            minHeight="120px"
          >
            <div className="text-center text-gray-600">
              <div className="text-lg">Simple Drop Zone</div>
              <div className="text-sm">Drop the purple box here!</div>
            </div>
          </PdndDropZone>
        </div>
      </div>
    </div>
  );
};