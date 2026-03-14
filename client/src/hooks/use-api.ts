import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useSettings } from "./use-settings";
import { useToast } from "./use-toast";

// ============================================
// PROJECTS HOOKS
// ============================================

export function useProjects() {
  return useQuery({
    queryKey: [api.projects.list.path],
    queryFn: async () => {
      const res = await fetch(api.projects.list.path);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return api.projects.list.responses[200].parse(await res.json());
    },
  });
}

export function useProject(id?: string | null) {
  return useQuery({
    queryKey: [api.projects.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.projects.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch project");
      return api.projects.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.projects.delete.path, { id });
      const res = await fetch(url, { method: api.projects.delete.method });
      if (!res.ok) throw new Error("Failed to delete project");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
      toast({ title: "Project deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Error deleting project", description: err.message, variant: "destructive" });
    }
  });
}

// ============================================
// CONVERSION & UPLOAD HOOKS
// ============================================

export function useUpload() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch(api.upload.create.path, {
        method: api.upload.create.method,
        body: formData, // Browser sets multipart/form-data with boundary
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Upload failed");
      }
      return api.upload.create.responses[201].parse(await res.json());
    },
    onError: (err: any) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  });
}

export function useConvert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { settings } = useSettings();

  return useMutation({
    mutationFn: async (id: string) => {
      const payload = {
        id,
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        baseUrl: settings.baseUrl
      };

      const res = await fetch(api.convert.create.path, {
        method: api.convert.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Conversion failed");
      }
      return api.convert.create.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, id] });
      toast({ title: "Conversion complete", description: "Your design is ready!" });
    },
    onError: (err: any) => {
      toast({ title: "Conversion failed", description: err.message, variant: "destructive" });
    }
  });
}

export function useChat() {
  const { settings } = useSettings();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, messages }: { projectId: string, messages: {role: "user"|"assistant"|"system", content: string}[] }) => {
      const payload = {
        projectId,
        messages,
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        baseUrl: settings.baseUrl
      };

      const res = await fetch(api.chat.create.path, {
        method: api.chat.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Chat failed");
      return api.chat.create.responses[200].parse(await res.json());
    },
    onError: (err: any) => {
      toast({ title: "Failed to send message", description: err.message, variant: "destructive" });
    }
  });
}
