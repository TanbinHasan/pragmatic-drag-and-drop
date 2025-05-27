// src/utils/pdnd-core.ts
import { useRef, useEffect, useState, useCallback } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import invariant from 'tiny-invariant';

// ============ TYPES (Copied from reference project) ============
export interface PdndData extends Record<string | symbol, unknown> {
  id: string;
  type: string;
  [key: string]: any;
}

export type PdndHoverState = 'idle' | 'validDrop' | 'invalidDrop';
export type Edge = 'top' | 'bottom' | 'left' | 'right';

// Card state types from reference project
export type TCardState =
  | {
      type: 'idle';
    }
  | {
      type: 'is-dragging';
    }
  | {
      type: 'is-dragging-and-left-self';
    }
  | {
      type: 'is-over';
      dragging: DOMRect;
      closestEdge: Edge;
    }
  | {
      type: 'preview';
      container: HTMLElement;
      dragging: DOMRect;
    };

const idle: TCardState = { type: 'idle' };

// Styles from reference project
const innerStyles: { [Key in TCardState['type']]?: string } = {
  idle: 'hover:outline outline-2 outline-neutral-50 cursor-grab',
  'is-dragging': 'opacity-40',
};

const outerStyles: { [Key in TCardState['type']]?: string } = {
  'is-dragging-and-left-self': 'hidden',
};

export interface PdndDragOptions {
  onDragStart?: (data: PdndData) => void;
  onDragEnd?: (data: PdndData) => void;
  disabled?: boolean;
  customPreview?: boolean;
  dragHandle?: string;
}

export interface PdndDropOptions {
  canDrop?: (data: PdndData) => boolean;
  onDragEnter?: (data: PdndData) => void;
  onDragLeave?: () => void;
  allowedEdges?: Edge[];
  getIsSticky?: () => boolean;
}

// ============ DRAG DATA UTILITIES (From reference project) ============
const cardKey = Symbol('card');
export type TCardData = {
  [cardKey]: true;
  card: PdndData;
  columnId: string;
  rect: DOMRect;
};

export function getCardData({
  card,
  rect,
  columnId,
}: Omit<TCardData, typeof cardKey> & { columnId: string }): TCardData {
  return {
    [cardKey]: true,
    rect,
    card,
    columnId,
  };
}

export function isCardData(value: Record<string | symbol, unknown>): value is TCardData {
  return Boolean(value[cardKey]);
}

export function isDraggingACard({
  source,
}: {
  source: { data: Record<string | symbol, unknown> };
}): boolean {
  return isCardData(source.data);
}

const cardDropTargetKey = Symbol('card-drop-target');
export type TCardDropTargetData = {
  [cardDropTargetKey]: true;
  card: PdndData;
  columnId: string;
};

export function isCardDropTargetData(
  value: Record<string | symbol, unknown>,
): value is TCardDropTargetData {
  return Boolean(value[cardDropTargetKey]);
}

export function getCardDropTargetData({
  card,
  columnId,
}: Omit<TCardDropTargetData, typeof cardDropTargetKey> & {
  columnId: string;
}): TCardDropTargetData {
  return {
    [cardDropTargetKey]: true,
    card,
    columnId,
  };
}

// Safari detection from reference project
function isSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const { userAgent } = navigator;
  return userAgent.includes('AppleWebKit') && !userAgent.includes('Chrome');
}

// Shallow equal utility from reference project
function isShallowEqual(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }
  return keys1.every((key1) => Object.is(obj1[key1], obj2[key1]));
}

// ============ ENHANCED HOOKS (Based on reference project) ============
export function usePdndDraggable<T extends PdndData>(
  data: T,
  columnId: string = 'default',
  options: PdndDragOptions = {}
) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // Find drag handle or use inner element
    const dragElement = options.dragHandle ? 
      outer.querySelector(options.dragHandle) as HTMLElement : 
      inner;

    if (!dragElement) return;

    const dragData = getCardData({ card: data, columnId, rect: inner.getBoundingClientRect() });

    return draggable({
      element: dragElement,
      getInitialData: ({ element }) => {
        // Always use the inner element for rect calculation
        const rect = inner.getBoundingClientRect();
        return getCardData({ card: data, columnId, rect });
      },
      onGenerateDragPreview({ nativeSetDragImage, location, source }) {
        const dragData = source.data;
        invariant(isCardData(dragData));
        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: preserveOffsetOnSource({ element: inner, input: location.current.input }),
          render({ container }) {
            setState({
              type: 'preview',
              container,
              dragging: inner.getBoundingClientRect(),
            });
          },
        });
      },
      onDragStart() {
        setState({ type: 'is-dragging' });
        options.onDragStart?.(data);
      },
      onDrop() {
        setState(idle);
        options.onDragEnd?.(data);
      },
    });
  }, [data, columnId, options.onDragStart, options.onDragEnd, options.dragHandle]);

  return {
    outerRef,
    innerRef,
    state,
    isDragging: state.type === 'is-dragging' || state.type === 'is-dragging-and-left-self',
  };
}

export function usePdndDropTarget(
  acceptedTypes: string[],
  onDrop: (data: PdndData, edge?: Edge) => void,
  columnId: string = 'default',
  card: PdndData,
  options: PdndDropOptions = {}
) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);

  const validateDrop = useCallback((data: PdndData): boolean => {
    const isAcceptedType = acceptedTypes.includes(data.type);
    const customCanDrop = options.canDrop ? options.canDrop(data) : true;
    return isAcceptedType && customCanDrop;
  }, [acceptedTypes, options.canDrop]);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    return dropTargetForElements({
      element: outer,
      getIsSticky: () => true,
      canDrop: ({ source }) => {
        if (!isCardData(source.data)) return false;
        return validateDrop(source.data.card);
      },
      getData: ({ element, input }) => {
        const data = getCardDropTargetData({ card, columnId });
        return attachClosestEdge(data, { element, input, allowedEdges: ['top', 'bottom'] });
      },
      onDragEnter({ source, self }) {
        if (!isCardData(source.data)) return;
        if (source.data.card.id === card.id) return;
        
        const closestEdge = extractClosestEdge(self.data);
        if (!closestEdge) return;

        setState({ type: 'is-over', dragging: source.data.rect, closestEdge });
      },
      onDrag({ source, self }) {
        if (!isCardData(source.data)) return;
        if (source.data.card.id === card.id) return;
        
        const closestEdge = extractClosestEdge(self.data);
        if (!closestEdge) return;
        
        const proposed: TCardState = { type: 'is-over', dragging: source.data.rect, closestEdge };
        setState((current) => {
          if (isShallowEqual(proposed as any, current as any)) {
            return current;
          }
          return proposed;
        });
      },
      onDragLeave({ source }) {
        if (!isCardData(source.data)) return;
        if (source.data.card.id === card.id) {
          setState({ type: 'is-dragging-and-left-self' });
          return;
        }
        setState(idle);
      },
      onDrop({ source, self }) {
        if (!isCardData(source.data)) return;
        const edge = extractClosestEdge(self.data);
        onDrop(source.data.card, edge || undefined);
        setState(idle);
      },
    });
  }, [card, columnId, validateDrop, onDrop]);

  return {
    outerRef,
    state,
    hoverState: state.type === 'is-over' ? 'validDrop' as const : 'idle' as const,
    closestEdge: state.type === 'is-over' ? state.closestEdge : undefined,
    draggingRect: state.type === 'is-over' ? state.dragging : undefined,
  };
}

// ============ UTILITIES (From reference project) ============
export const pdndUtils = {
  reorderArray: <T>(array: T[], startIndex: number, endIndex: number): T[] => {
    return reorder({ list: array, startIndex, finishIndex: endIndex });
  },

  reorderArrayWithEdge: <T>(
    array: T[], 
    startIndex: number, 
    targetIndex: number, 
    edge: Edge,
    axis: 'vertical' | 'horizontal' = 'vertical'
  ): T[] => {
    return reorderWithEdge({
      list: array,
      startIndex,
      indexOfTarget: targetIndex,
      closestEdgeOfTarget: edge,
      axis,
    });
  },

  createDragData: (id: string, type: string, extraData: Record<string, any> = {}): PdndData => ({
    id,
    type,
    ...extraData,
  }),

  getInnerStyles: (state: TCardState) => innerStyles[state.type] || '',
  getOuterStyles: (state: TCardState) => outerStyles[state.type] || '',
};