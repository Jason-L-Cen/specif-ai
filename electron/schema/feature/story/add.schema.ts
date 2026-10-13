import { z } from 'zod';

export const addUserStorySchema = z.object({
    name: z.string().min(1, "应用名称不能为空"),
    description: z.string().min(1, "应用描述不能为空"),
    reqId: z.string().min(1, "产品需求 ID 不能为空"),
    reqDesc: z.string().min(1, "产品需求不能为空"),
    featureId: z.string().min(1, "用户故事 ID 不能为空"),
    featureRequest: z.string().min(1, "用户故事请求不能为空"),
    contentType: z.string(),
    fileContent: z.string(),
    useGenAI: z.boolean()
});

export type AddUserStoryRequest = z.infer<typeof addUserStorySchema>;

export interface AddUserStoryResponse extends AddUserStoryRequest {
    features: Array<{
        id: string;
        [key: string]: string;
    }>;
}
