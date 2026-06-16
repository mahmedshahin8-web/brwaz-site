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
  category?: string;
  title: string;
  hook: string;
  angle: string;
  hook_instruction?: string;
  suspense_level?: number;
  narrative_strategy?: string;
}

export interface ChapterOutline {
  chapter_number: number;
  chapter_title: string;
  chapter_description: string;
  core_premise?: string;
  key_revelations?: string[];
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
  research_data?: string;
  central_hypothesis?: string;
  core_conflict_or_mystery?: string;
  hidden_patterns_or_contradictions?: string[];
  editorial_angle?: string;
  timeline?: any[];
}

export type PersonaType = "النبّاش" | "برواز التاريخ" | "برواز التكنو" | "برواز الحكاوي" | "شاهد على العصر" | "الشاهد الصامت" | "الهرم الرابع" | "الدحيح";

export type MoodType = string;

export interface ArchivalQuote {
  speaker: string;
  quote_text: string;
  source_context?: string;
  is_audio_available?: boolean;
}

export interface EpisodeScene {
  asset_id: string;
  voice_over: string;
  clean_tts?: string;
  visual_cue: string;
  b_roll_search_query?: string;
  sfx?: string;
  image_prompt?: string;
  ai_video_prompt?: string;
  multi_camera_angles?: any[];
  pexelsAsset?: {
    id: number;
    url: string;
    image: string;
    videoFiles: any[];
  } | null;
  montage_instructions: string;
  sound_design: string;
  music_prompt?: string;
  sfx_prompt?: string;
  first_frame_image_prompt?: string;
  first_frame_motion_prompt?: string;
  second_frame_image_prompt?: string;
  second_frame_motion_prompt?: string;
  archival_quotes?: ArchivalQuote[];
  generated_image_url?: string;
  b_roll_keywords?: string; // Plan 1: Keywords for searching stock footage
  cinematic_movement?: string; // Veo 2 / Runway slow motion guidelines
  visual_motif?: string; // Microfilm effect, leaked docs, etc.
  asmr_soundscape?: string; // ASMR immersive sound to replace human action
  archive_search_queries?: string[]; // Plan: standardized search queries for archives
  voiceover_notes?: string; // Notes for human VO artist
  estimated_duration_seconds?: number; // Estimated time in seconds
  asset_prompts?: string[];
  sources?: SourceDef[];
  asset_status?: "pending" | "rendering" | "completed";
  status?: "pending" | "approved" | "regenerating";
  retention_pattern?: string; // Pattern Interrupt, Fast Cut Formula, etc.
  psychoacoustic_guidance?: string; // Binaural Beats, ambient suggestions, etc.
  transition_to_next_scene?: "Match Cut" | "Hard Cut" | "Same Scene" | "New Location";
  generated_video_url?: string;
  first_frame_url?: string;
  second_frame_url?: string;
  // Optional legacy fields to avoid breaking existing UI
  visual_audio_map?: string;
  overlay_image?: string;
  shot_type?: string;
  motion_prompt_english?: string;
  audio_sfx_music_prompt?: string;
  audio_url?: string;
  is_mastered?: boolean;
  word_timestamps?: { word: string; start: number; end: number; }[];
  loop_type?: "O" | "C" | null;
  loop_id?: string;
  narrative_strategy?: "HCS" | "HAP";
  visual_treatment?: string;
  stock_search_queries?: { platform: "pexels" | "mixkit" | "freesound"; query: string }[];
  comparison_version?: EpisodeScene;
  engine_source?: "gemini" | "ollama";
}

export interface PublishingKit {
  youtube_titles: string[];
  thumbnail_prompt: string;
  description: string;
  thumbnail_concept?: string;
  description_al_daheeh_style?: string;
  thumbnail_midjourney_prompt?: string;
  chapters?: { title: string; timestamp: string; }[];
  tags: string[];
  omnichannel?: {
    twitter_thread?: string[];
    social_posts?: { platform: string; content: string }[];
  };
  shorts?: any[];
}

export interface ShortsData {
  title: string;
  hook: string;
  body: string; // Plan 3: specific structure
  cta: string; // Plan 3
  visual_instructions: string;
  vertical_image_prompt?: string;
}

export interface OmnichannelKit {
  twitter_thread: string[];
  social_posts: { platform: string; content: string }[];
}

export interface AuditIssue {
  type: "fact_check" | "logic" | "legal" | "tone" | "boredom_alert" | "open_loop" | "time_pricing" | "sentence_too_long";
  finding: string;
  recommendation: string;
  flawed_text_snippet?: string;
  scene_index?: number;
  source_reference?: string;
  severity?: "high" | "medium" | "low";
  description?: string;
}

export interface SecurityAudit {
  status: "verified" | "warning" | "failed";
  executive_summary: string;
  issues: AuditIssue[];
  red_team_score?: number;
}

export interface EchoChamberData {
  skeptics: { user: string; comment: string; rebuttal_tip: string }[];
  hype_men: { user: string; comment: string; viral_hook: string }[];
  critics: { user: string; comment: string; risk_factor: string }[];
}

export interface KnowledgeLoopData {
  suggested_links: { title: string; connection_logic: string; loop_strategy: string }[];
}

export interface ThumbnailBlueprint {
  prompt: string;
  text: string;
  mood_color_instructions: string;
}

export interface EpisodeData {
  id?: string;
  video_title: string;
  mood?: string;
  thumbnail: {
    image_prompt: string;
    text_on_image: string;
  };
  thumbnail_blueprint?: ThumbnailBlueprint;
  opening_sketch: EpisodeScene;
  scenes: EpisodeScene[];
  sources: (string | SourceDef)[];
  publishing_kit: PublishingKit;
  shorts: ShortsData[];
  omnichannel?: OmnichannelKit;
  audit_report?: SecurityAudit;
  createdAt?: any;
}
