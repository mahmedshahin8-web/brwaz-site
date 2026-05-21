import React, { useState } from "react";
import { EpisodeScene } from "../types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SceneCard } from "./SceneCard";
import { GripHorizontal } from "lucide-react";

interface TimelineEditorProps {
  scenes: EpisodeScene[];
  onUpdateScene: (index: number, updatedScene: EpisodeScene) => void;
  onReorderScenes: (newScenes: EpisodeScene[]) => void;
  copyToClipboard: (text: string, message?: string) => void;
}

function SortableSceneNode({ id, scene, index, onUpdate, copyToClipboard }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };
  
  // Calculate a simplified "dramatic curve" height based on الإيقاع or dramatic pauses
  const bpm = scene.music_bpm || 60;
  const heightIntensity = Math.min(Math.max((bpm - 50) / 100, 0.2), 1); // 0.2 to 1

  return (
    <div ref={setNodeRef} style={style} className="min-w-[400px] flex-shrink-0 flex flex-col gap-2">
      {/* Dramatic Curve Header */}
      <div className="h-14 bg-white/20 border border-gray-200 relative flex items-end px-4 pb-2 overflow-hidden group rounded-t-2xl">
        <div 
          className="absolute bottom-0 left-0 right-0 bg-accent-danger/20" 
          style={{ height: `${heightIntensity * 100}%`, transition: 'height 0.3s' }} 
        />
        <div {...attributes} {...listeners} className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing text-text-muted active:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <GripHorizontal className="w-6 h-6" />
        </div>
        <span className="relative z-10 text-gray-900 font-['JetBrains_Mono'] tracking-tight text-xs shadow-black drop-shadow-md">
          مشهد {index + 1} | الإيقاع: {bpm}
        </span>
      </div>
      
      {/* Card Content */}
      <div className="h-[600px] overflow-y-auto custom-scrollbar border border-t-0 border-gray-200 rounded-b-2xl bg-white/10">
        <SceneCard 
          scene={scene} 
          onUpdate={(updated) => onUpdate(index, updated)} 
          copyToClipboard={copyToClipboard} 
        />
      </div>
    </div>
  );
}

export function TimelineEditor({ scenes, onUpdateScene, onReorderScenes, copyToClipboard }: TimelineEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = scenes.findIndex((s) => s.asset_id === active.id);
      const newIndex = scenes.findIndex((s) => s.asset_id === over?.id);
      onReorderScenes(arrayMove(scenes, oldIndex, newIndex));
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-4 min-w-max items-start">
          <SortableContext 
            items={scenes.map(s => s.asset_id)}
            strategy={horizontalListSortingStrategy}
          >
            {scenes.map((scene, i) => (
              <SortableSceneNode
                key={scene.asset_id}
                id={scene.asset_id}
                index={i}
                scene={scene}
                onUpdate={onUpdateScene}
                copyToClipboard={copyToClipboard}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
