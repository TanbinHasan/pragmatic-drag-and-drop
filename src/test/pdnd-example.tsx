// src/test/pdnd-example.tsx
import { useState } from 'react';
import { SingleColumnBoard, type TCard } from '../utils';

export function PdndExample() {
  const [cards, setCards] = useState<TCard[]>([
    { id: '1', description: '🚀 Setup project structure' },
    { id: '2', description: '📦 Install dependencies' },
    { id: '3', description: '🎨 Create beautiful UI' },
    { id: '4', description: '🧪 Write comprehensive tests' },
    { id: '5', description: '📝 Update documentation' },
  ]);

  const handleAddCard = () => {
    const newCard: TCard = {
      id: `card-${Date.now()}`,
      description: `✨ New task #${cards.length + 1}`,
    };
    setCards(prev => [...prev, newCard]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎯 Pragmatic Drag & Drop Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A beautiful single-column Kanban board with smooth drag-and-drop functionality. 
            Try dragging the cards to reorder them!
          </p>
        </div>

        {/* Demo Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{cards.length}</div>
            <div className="text-sm text-gray-500">Total Cards</div>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">1</div>
            <div className="text-sm text-gray-500">Column</div>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">∞</div>
            <div className="text-sm text-gray-500">Possibilities</div>
          </div>
        </div>

        {/* Board */}
        <SingleColumnBoard
          initialCards={cards}
          columnTitle="📋 Task Board"
          onCardsChange={setCards}
          onAddCard={handleAddCard}
        />

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-12 bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎮 How to Use</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Drag & Drop:</strong> Click and drag any card to reorder them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span><strong>Add Cards:</strong> Click the "Add a card" button to create new tasks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span><strong>Visual Feedback:</strong> Watch for drop shadows and hover effects</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}