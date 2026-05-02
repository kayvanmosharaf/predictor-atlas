export interface PlaybookSource {
  name: string;
  description: string;
  weight: number;
  searchHints?: string[];
}

export interface Playbook {
  key: string;
  category: string;
  label: string;
  systemContext: string;
  sources: PlaybookSource[];
  modelTemplate: string;
  criticChecklist: string[];
}
