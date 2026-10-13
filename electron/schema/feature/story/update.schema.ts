import { z } from 'zod';

export const updateStorySchema = z.object({
  name: z.string(),
  description: z.string(),
  reqId: z.string().min(1, "产品需求 ID 不能为空"),
  reqDesc: z.string(),
  featureId: z.string().min(1, "用户故事 ID 不能为空"),
  featureRequest: z.string(),
  existingFeatureTitle: z.string(),
  existingFeatureDesc: z.string(),
  contentType: z.string(),
  fileContent: z.string(),
  useGenAI: z.boolean()
});

export type UpdateStoryRequest = z.infer<typeof updateStorySchema>;

export interface Feature {
  id: string;
  [key: string]: string;
}

export interface UpdateStoryResponse extends UpdateStoryRequest {
  features: Feature[];
}
