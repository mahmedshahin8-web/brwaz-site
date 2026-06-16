import { apiFetch } from "./apiFetch";

export interface RenderJobStatus {
  id: string;
  projectId: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  videoUrl: string | null;
  logs: string;
}

export const startRenderJob = async (projectId: string, scriptTimestamps: any) => {
  return await apiFetch('/api/render/start', {
    method: 'POST',
    body: JSON.stringify({ projectId, scriptTimestamps })
  });
};

export const fetchRenderStatus = async (jobId: string): Promise<{ success: boolean; job: RenderJobStatus }> => {
  const res = await apiFetch(`/api/render/status/${jobId}`);
  return res.json();
};
