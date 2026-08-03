import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";

const MOCK_API_KEYS: Record<string, { key: string; label?: string }> = {};
const MOCK_AI_SETTINGS = {
  primaryModel: "claude-3-5-sonnet-20241022",
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: "",
  chainOfThought: true,
  useOllama: false,
  ollamaUrl: "http://localhost:11434",
};

export const adminRouter = router({
  getApiKeys: publicProcedure.query(async () => {
    return Object.entries(MOCK_API_KEYS).map(([service, data], i) => ({
      id: i + 1,
      service,
      keyValue: data.key ? `${data.key.substring(0, 8)}••••••••` : "",
      label: data.label ?? service,
      isActive: !!data.key,
      createdAt: new Date(),
    }));
  }),

  upsertApiKey: publicProcedure
    .input(z.object({
      service: z.string(),
      keyValue: z.string().min(1),
      label: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      MOCK_API_KEYS[input.service] = { key: input.keyValue, label: input.label };
      return { success: true };
    }),

  deleteApiKey: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  getAiSettings: publicProcedure.query(async () => MOCK_AI_SETTINGS),

  updateAiSettings: publicProcedure
    .input(z.object({
      primaryModel: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(256).max(200000).optional(),
      systemPrompt: z.string().optional(),
      chainOfThought: z.boolean().optional(),
      useOllama: z.boolean().optional(),
      ollamaUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      Object.assign(MOCK_AI_SETTINGS, input);
      return { success: true };
    }),

  testApiKey: publicProcedure
    .input(z.object({ service: z.string() }))
    .mutation(async ({ input }) => {
      const data = MOCK_API_KEYS[input.service];
      return { success: !!data?.key, message: data?.key ? "Key is configured" : "No key configured" };
    }),
});
