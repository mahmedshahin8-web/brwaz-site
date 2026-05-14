export interface OsintQuery {
  topic: string;
  focus_angle?: string; // Specific angle or question to focus on (optional)
  depth: "quick" | "standard" | "deep_dive"; // Controls how exhaustive the search is
  timeframe?: string; // e.g., "last 5 years", "2010-2020"
}

export interface DossierEntity {
  name: string;
  role_or_type: "Person" | "Organization" | "Location" | "Concept" | "Other";
  description: string;
  key_connections?: string[];
}

export interface DossierEvent {
  date_or_period: string;
  event_description: string;
  impact: string;
}

export interface DossierSource {
  title: string;
  url: string;
  credibility_score?: number; // 1 to 10
  key_takeaway: string;
}

export interface OsintDossier {
  id: string; // Unique ID (e.g., hash of the topic) for local caching
  topic: string;
  created_at: string; // ISO String
  last_updated: string; // ISO String
  
  executive_summary: string; // Comprehensive overview
  timeline: DossierEvent[]; // Chronological sequence of events
  key_entities: DossierEntity[]; // Main players/components
  core_conflict_or_mystery: string; // The dramatic core of the topic
  verified_facts: string[]; // Bullet points of confirmed data
  hidden_patterns_or_contradictions: string[]; // Reads between the lines (conflicting narratives, hidden motives)
  historical_visual_anchors: string[]; // Real-world visual details (e.g. "1940s Fedora", "Brown brick facade") for accurate Midjourney generation
  
  sources: DossierSource[]; // References gathered
  
  // A stringified version of the core data to easily pass as context to Node 1
  compiled_research_context: string; 
}

export interface RadarSuggestion {
  id: number;
  title: string;
  hook: string;
  angle: string;
}

export interface ChapterOutline {
  chapter_number: number;
  chapter_title: string;
  chapter_description: string;
  key_points?: string[];
}

export interface SourceDef {
  title: string;
  url: string;
  info: string;
}

export interface MasterOutline {
  video_title: string;
  chapters: ChapterOutline[];
  thumbnail: {
    image_prompt: string;
    text_on_image: string;
  };
  sources: (string | SourceDef)[];
}

export type PersonaType = "النبّاش" | "برواز التاريخ" | "برواز التكنو" | "برواز الحكاوي";

export interface EpisodeScene {
  asset_id: string;
  voice_over: string;
  visual_cue: string;
  montage_instructions: string;
  sound_design: string;
  music_prompt?: string;
  sfx_prompt?: string;
  image_prompt_nano_banana: string;
  ai_video_prompt: string;
  generated_image_url?: string;
  b_roll_keywords?: string; // Plan 1: Keywords for searching stock footage
  cinematic_movement?: string; // Veo 2 / Runway slow motion guidelines
  visual_motif?: string; // Microfilm effect, leaked docs, etc.
  asmr_soundscape?: string; // ASMR immersive sound to replace human action
  voiceover_notes?: string; // Notes for human VO artist
  estimated_duration_seconds?: number; // Estimated time in seconds
  asset_prompts?: string[];
  sources?: SourceDef[];
  status?: "pending" | "approved" | "regenerating";
  // Optional legacy fields to avoid breaking existing UI
  visual_audio_map?: string;
  overlay_image?: string;
  shot_type?: string;
  motion_prompt_english?: string;
  audio_sfx_music_prompt?: string;
}

export interface PublishingKit {
  youtube_titles: string[];
  thumbnail_concept: string;
  thumbnail_midjourney_prompt: string;
  description_al_daheeh_style: string;
  tags: string[];
  youtube_title?: string;
  thumbnail_hook_text?: string;
}

export interface ShortsData {
  title: string;
  hook: string;
  body: string; // Plan 3: specific structure
  cta: string; // Plan 3
  visual_instructions: string;
}

export interface EpisodeData {
  id?: string;
  video_title: string;
  thumbnail: {
    image_prompt: string;
    text_on_image: string;
  };
  opening_sketch: EpisodeScene;
  scenes: EpisodeScene[];
  sources: (string | SourceDef)[];
  publishing_kit: PublishingKit;
  shorts: ShortsData[];
  createdAt?: any;
}
