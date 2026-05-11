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
  
  // Calculate a simplified "dramatic curve" height based on BPM or dramatic pauses
  const bpm = scene.music_bpm || 60;
  const heightIntensity = Math.min(Math.max((bpm - 50) / 100, 0.2), 1); // 0.2 to 1

  return (
    <div ref={setNodeRef} style={style} className="min-w-[400px] flex-shrink-0 flex flex-col gap-2">
      {/* Dramatic Curve Header */}
      <div className="h-16 bg-[#1a1a1a] border-2 border-[#1a1a1a] relative flex items-end px-2 pb-1 overflow-hidden group">
        <div 
          className="absolute bottom-0 left-0 right-0 bg-red-700 opacity-80" 
          style={{ height: `${heightIntensity * 100}%`, transition: 'height 0.3s' }} 
        />
        <div {...attributes} {...listeners} className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <GripHorizontal className="w-8 h-8" />
        </div>
        <span className="relative z-10 text-white font-mono text-xs shadow-black drop-shadow-md">
          Seq {index + 1} | BPM: {bpm}
        </span>
      </div>
      
      {/* Card Content */}
      <div className="h-[600px] overflow-y-auto barwaz-scrollbar border-2 border-[#1a1a1a]">
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
    <div className="w-full overflow-x-auto pb-8 barwaz-scrollbar">
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
