import { z } from "zod";
import { projects, insertProjectSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  projects: {
    list: {
      method: "GET" as const,
      path: "/api/projects" as const,
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/projects/:id" as const,
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/projects/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  upload: {
    create: {
      method: "POST" as const,
      path: "/api/upload" as const,
      // Input is FormData (not explicitly validated with Zod)
      responses: {
        201: z.object({
          id: z.string(),
          filename: z.string(),
          url: z.string(),
        }),
        400: errorSchemas.validation,
      }
    }
  },
  convert: {
    create: {
      method: "POST" as const,
      path: "/api/convert" as const,
      input: z.object({
        id: z.string(),
        provider: z.string(),
        apiKey: z.string().optional(),
        model: z.string().optional(),
        baseUrl: z.string().optional()
      }),
      responses: {
        200: z.object({
          html: z.string(),
          css: z.string(),
          js: z.string(),
          description: z.string(),
          components: z.array(z.string()),
        }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    }
  },
  chat: {
    create: {
      method: "POST" as const,
      path: "/api/chat" as const,
      input: z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string()
        })),
        projectId: z.string(),
        provider: z.string(),
        apiKey: z.string().optional(),
        model: z.string().optional(),
        baseUrl: z.string().optional()
      }),
      responses: {
        200: z.object({
          message: z.string()
        }),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export const ws = {
  send: {},
  receive: {
    status: z.object({ message: z.string() }),
    preview_ready: z.object({ uuid: z.string() })
  }
};
