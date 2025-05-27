// src/utils/pdnd-components.tsx
import React from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { 
  usePdndDraggable, 
  usePdndDropTarget,
  pdndUtils,
} from './pdnd-core';
import type { PdndData, Edge, TCardState } from './pdnd-core';

// ============ CARD SHADOW COMPONENT (From reference project) ============
export function CardShadow({ dragging }: { dragging: DOMRect }) {
  return <div className="flex-shrink-0 rounded bg-slate-900" style={{ height: dragging.height }} />;
}

// ============ CARD DISPLAY COMPONENT (From reference project) ============
export function CardDisplay({
  card,
  state,
  outerRef,
  innerRef,
}: {
  card: PdndData;
  state: TCardState;
  outerRef?: React.MutableRefObject<HTMLDivElement | null>;
  innerRef?: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const outerStyles = pdndUtils.getOuterStyles(state);
  const innerStyles = pdndUtils.getInnerStyles(state);

  return (
    <div
      ref={outerRef}
      className={`flex flex-shrink-0 flex-col gap-2 px-3 py-1 ${outerStyles}`}
    >
      {/* Put a shadow before the item if closer to the top edge */}
      {state.type === 'is-over' && state.closestEdge === 'top' ? (
        <CardShadow dragging={state.dragging} />
      ) : null}
      <div
        className={`rounded bg-slate-700 p-2 text-slate-300 ${innerStyles}`}
        ref={innerRef}
        style={
          state.type === 'preview'
            ? {
                width: state.dragging.width,
                height: state.dragging.height,
                transform: 'rotate(4deg)',
              }
            : undefined
        }
      >
        <div>{card.title || card.description || `Card ${card.id}`}</div>
      </div>
      {/* Put a shadow after the item if closer to the bottom edge */}
      {state.type === 'is-over' && state.closestEdge === 'bottom' ? (
        <CardShadow dragging={state.dragging} />
      ) : null}
    </div>
  );
}

// ============ ENHANCED CARD COMPONENT (Based on reference project) ============
export function PdndCard({ card, columnId }: { card: PdndData; columnId: string }) {
  const { outerRef, innerRef, state } = usePdndDraggable(card, columnId, {
    dragHandle: '[data-drag-handle]'
  });
  const dropTarget = usePdndDropTarget(
    ['task'], 
    () => {}, 
    columnId, 
    card
  );

  // Merge refs for drop target
  const mergedOuterRef = React.useCallback((element: HTMLDivElement | null) => {
    if (outerRef.current !== element) {
      outerRef.current = element;
    }
    if (dropTarget.outerRef.current !== element) {
      dropTarget.outerRef.current = element;
    }
  }, [outerRef, dropTarget.outerRef]);

  // Use drop target state if available, otherwise use drag state
  const finalState = dropTarget.state.type !== 'idle' ? dropTarget.state : state;

  return (
    <>
      <CardDisplay outerRef={outerRef} innerRef={innerRef} state={finalState} card={card} />
      {state.type === 'preview'
        ? createPortal(<CardDisplay state={state} card={card} />, state.container)
        : null}
    </>
  );
}

// ============ FIXED SORTABLE LIST ITEM (No real-time reordering) ============
interface PdndSortableItemProps {
  item: PdndData;
  index: number;
  onReorder: (startIndex: number, endIndex: number, edge: Edge) => void;
  onDragStart?: (data: PdndData) => void;
  onDragEnd?: (data: PdndData) => void;
  children: React.ReactNode;
  className?: string;
}

export const PdndSortableItem: React.FC<PdndSortableItemProps> = ({
  item,
  index,
  onReorder,
  onDragStart,
  onDragEnd,
  children,
  className = '',
}) => {
  const columnId = 'sortable-list';
  const cardWithIndex = { ...item, index };
  
  const { outerRef, innerRef, state } = usePdndDraggable(cardWithIndex, columnId, {
    onDragStart,
    onDragEnd,
    dragHandle: '[data-drag-handle]',
  });

  // Fixed drop target - only handle final drop, no real-time reordering
  const dropTarget = usePdndDropTarget(
    [item.type],
    (dragData: PdndData, edge?: Edge) => {
      // Only handle drop, not during drag
      if (dragData.id === item.id) return;
      
      const dragIndex = Number(dragData.index) || 0;
      const dropIndex = index;
      
      console.log('Final drop:', { 
        dragIndex, 
        dropIndex, 
        edge,
        dragItem: dragData.title || dragData.id,
        dropItem: item.title || item.id 
      });
      
      onReorder(dragIndex, dropIndex, edge || 'bottom');
    },
    columnId,
    cardWithIndex,
    {
      allowedEdges: ['top', 'bottom'],
      getIsSticky: () => true,
    }
  );

  // Merge refs
  const mergedOuterRef = React.useCallback((element: HTMLDivElement | null) => {
    if (outerRef.current !== element) {
      outerRef.current = element;
    }
    if (dropTarget.outerRef.current !== element) {
      dropTarget.outerRef.current = element;
    }
  }, [outerRef, dropTarget.outerRef]);

  // Use drop target state if available, otherwise use drag state
  const finalState = dropTarget.state.type !== 'idle' ? dropTarget.state : state;
  const outerStyles = pdndUtils.getOuterStyles(finalState);
  const innerStyles = pdndUtils.getInnerStyles(finalState);

  return (
    <div
      ref={mergedOuterRef}
      className={`relative group transition-all duration-200 ${outerStyles} ${className}`}
    >
      {/* Top shadow */}
      {finalState.type === 'is-over' && finalState.closestEdge === 'top' && (
        <div className="mb-2">
          <CardShadow dragging={finalState.dragging} />
        </div>
      )}

      {/* Drag handle - ONLY this should be draggable */}
      <div 
        data-drag-handle
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab hover:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <GripVertical size={16} className="text-gray-400 hover:text-gray-600" />
      </div>

      {/* Content */}
      <div
        ref={innerRef}
        className={`pl-8 rounded bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow ${innerStyles}`}
      >
        {children}
      </div>

      {/* Bottom shadow */}
      {finalState.type === 'is-over' && finalState.closestEdge === 'bottom' && (
        <div className="mt-2">
          <CardShadow dragging={finalState.dragging} />
        </div>
      )}

      {/* Preview portal */}
      {finalState.type === 'preview' && (
        createPortal(
          <div
            className={`rounded bg-white border border-gray-200 p-4 shadow-lg ${innerStyles}`}
            style={{
              width: finalState.dragging.width,
              height: finalState.dragging.height,
              transform: 'rotate(4deg)',
            }}
          >
            <div className="pl-8">
              {children}
            </div>
          </div>,
          finalState.container
        )
      )}
    </div>
  );
};

// ============ FIXED SORTABLE LIST CONTAINER ============
interface PdndSortableListProps<T extends PdndData> {
  items: T[];
  onReorder: (items: T[]) => void;
  title?: string;
  className?: string;
  emptyMessage?: string;
  onAddItem?: () => void;
  onRemoveItem?: (item: T) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addButtonText?: string;
}

export const PdndSortableList = <T extends PdndData>({
  items,
  onReorder,
  title,
  className = '',
  emptyMessage = 'No items yet',
  onAddItem,
  onRemoveItem,
  renderItem,
  addButtonText = 'Add Item',
}: PdndSortableListProps<T>) => {
  
  // Fixed reorder handler - only called on final drop, like reference project
  const handleReorderItems = (startIndex: number, endIndex: number, edge: Edge) => {
    console.log('Final reorder on drop:', { startIndex, endIndex, edge, itemsLength: items.length });
    
    // Validation checks
    if (startIndex < 0 || endIndex < 0) return;
    if (startIndex >= items.length || endIndex >= items.length) return;
    if (startIndex === endIndex) return;
    
    // Calculate final index based on edge, like reference project
    let finalIndex = endIndex;
    if (edge === 'bottom') {
      finalIndex = endIndex + 1;
    }
    
    // If dragging from above to below, adjust for the item being removed
    if (startIndex < finalIndex) {
      finalIndex -= 1;
    }
    
    // Use reorder logic from reference project
    const reorderedItems = pdndUtils.reorderArray(items, startIndex, finalIndex);
    
    console.log('Items reordered on final drop:', {
      from: startIndex,
      to: finalIndex,
      movedItem: items[startIndex]?.title || items[startIndex]?.name || items[startIndex]?.id
    });
    
    // Update state only on final drop
    onReorder(reorderedItems);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      {(title || onAddItem) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          )}
          {onAddItem && (
            <button
              onClick={onAddItem}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              {addButtonText}
            </button>
          )}
        </div>
      )}

      {/* List Container */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            {emptyMessage}
          </div>
        ) : (
          items.map((item, index) => (
            <PdndSortableItem
              key={item.id}
              item={{ ...item, index }}
              index={index}
              onReorder={handleReorderItems}
              className="transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {renderItem(item, index)}
                </div>
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </PdndSortableItem>
          ))
        )}
      </div>
    </div>
  );
};

// ============ SIMPLE LIST ITEM ============
interface PdndListItemProps {
  item: PdndData;
  onDragStart?: (data: PdndData) => void;
  onDragEnd?: (data: PdndData) => void;
  children: React.ReactNode;
  className?: string;
}

export const PdndListItem: React.FC<PdndListItemProps> = ({
  item,
  children,
  className = '',
  ...options
}) => {
  const { outerRef, innerRef, state } = usePdndDraggable(item, 'list-item', {
    ...options,
    dragHandle: '[data-drag-handle]',
  });
  const outerStyles = pdndUtils.getOuterStyles(state);
  const innerStyles = pdndUtils.getInnerStyles(state);

  return (
    <>
      <div
        ref={outerRef}
        className={`relative group ${outerStyles}`}
      >
        {/* Drag handle */}
        <div 
          data-drag-handle
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab hover:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <GripVertical size={16} className="text-gray-400 hover:text-gray-600" />
        </div>
        <div
          ref={innerRef}
          className={`pl-8 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${innerStyles} ${className}`}
        >
          {children}
        </div>
      </div>
      {state.type === 'preview' && (
        createPortal(
          <div
            className={`p-3 bg-white border border-gray-200 rounded-lg shadow-lg ${innerStyles} ${className}`}
            style={{
              width: state.dragging.width,
              height: state.dragging.height,
              transform: 'rotate(4deg)',
            }}
          >
            <div className="pl-8">
              {children}
            </div>
          </div>,
          state.container
        )
      )}
    </>
  );
};

// ============ CONTAINER WITH DROP ZONES ============
interface PdndContainerProps {
  acceptedTypes: string[];
  onItemDrop: (data: PdndData) => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  emptyMessage?: string;
  canDrop?: (data: PdndData) => boolean;
}

export const PdndContainer: React.FC<PdndContainerProps> = ({
  acceptedTypes,
  onItemDrop,
  children,
  title,
  className = '',
  emptyMessage = 'Drop items here',
  canDrop,
}) => {
  const dummyCard = { id: 'container', type: 'container' };
  const dropTarget = usePdndDropTarget(
    acceptedTypes,
    (data?: PdndData) => {
      if (data) onItemDrop(data);
    },
    'container',
    dummyCard,
    { canDrop }
  );

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
      )}
      <div
        ref={dropTarget.outerRef}
        className={`w-full border border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] transition-all duration-200 ${
          dropTarget.hoverState === 'validDrop' ? 'border-blue-500 bg-blue-50' : ''
        }`}
      >
        {React.Children.count(children) === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-2">{children}</div>
        )}
      </div>
    </div>
  );
};