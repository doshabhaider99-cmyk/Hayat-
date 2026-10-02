export interface AICharacter {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  avatar: string; // Emoji or URL
  voice: string; // Selected neural voice
  personality: string;
  role: string; // "Manager" or custom
  language: string;
  accent: string;
  greetingStyle: string;
  memory: string[];
  mood: string;
  voiceSettings: {
    pitch: number;
    speed: number;
    volume: number;
  };
  enabled: boolean;
  isDefault?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: "idle" | "processing" | "completed" | "error";
  avatar: string;
  color: string;
  recentAction?: string;
  enabled: boolean;
  logs: string[];
  category: "core" | "system" | "security" | "media" | "productivity" | "knowledge" | "automation";
  resourceUsage: {
    cpu: number;
    ram: number;
  };
}

export interface Memory {
  id: string;
  characterId?: string; // Linked to a specific character's separate memory
  category: "conversation" | "preferences" | "project" | "task" | "file";
  content: string;
  timestamp: string;
}

export interface TaskStep {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export interface TaskPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
  steps: TaskStep[];
  status: "idle" | "running" | "paused" | "completed";
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  frequency: string;
  status: "active" | "paused" | "stopped";
  lastRun?: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  status: "enabled" | "disabled" | "not_installed";
  verified: boolean;
  category: string;
}

export interface WorkflowAction {
  id: string;
  type: "action" | "conditional" | "delay" | "loop";
  label: string;
  config: string;
}

export interface SmartWorkflow {
  id: string;
  name: string;
  description: string;
  actions: WorkflowAction[];
  triggerType: "manual" | "event" | "schedule";
  isActive: boolean;
}

