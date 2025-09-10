import content from '@/content/content.json'

export type Project = {
  id: string; name: string; summary: string;
  problem?: string; role?: string; outcome?: string;
  tech?: string[]; media?: {type:'image'|'video'; src:string; alt?:string}[];
}

export function useContent() { return content }
export function getProjects(): Project[] { return (content as any).projects || [] }
export function getProjectById(id: string): Project | undefined {
  return getProjects().find(p => p.id === id)
}
