import { t as appText } from "../../services/language";
import type { IpcMainInvokeEvent } from 'electron';
import { verifyConfigSchema, VerifyConfigResponse } from '../../schema/core/verify-llm-config.schema';
import { LLMProvider } from '../../services/llm';
import { buildLLMHandler } from '../../services/llm';
console.log('[verify-config] Initializing LLM config verification handler');

export async function verifyConfig(event: IpcMainInvokeEvent, data: any): Promise<VerifyConfigResponse> {
  try {
    // Validate input data using schema
    console.log('[verify-config] Validating input data...');
    const validatedData = verifyConfigSchema.parse(data);
    console.debug('[verify-config] Input data validated successfully');

    const { provider, config = {} } = validatedData;

    // Create handler with the provided configuration
    console.log('[verify-config] Creating LLM handler...');

    const handler = buildLLMHandler(provider as LLMProvider, config);

    // Make a test call to verify the configuration
    console.log('[verify-config] Making test call to LLM...');
    const testPrompt = appText("这是用于验证模型服务商配置的测试提示词，请简短回复“连接成功”。");
    const testMessages = [{ role: 'user', content: testPrompt }];

    const result = await handler.invoke(testMessages, null, "core:verifyConfig");
    console.log('[verify-config] Test call succeeded');

    // For the response, use the actual model ID from the handler
    const actualModel = handler.getModel().id;

    return {
      status: 'success',
      message: appText("模型服务商配置验证成功"),
      provider,
      model: actualModel,
      testResponse: result
    };

  } catch (error: any) {
    console.error('[verify-config] Error during verification');
    
    return {
      status: 'failed',
      message: appText("模型连接失败，请检查身份验证凭据。"),
      provider: typeof data === 'object' && data ? (data as any).provider || 'unknown' : 'unknown',
      model: 'unknown'
    };
  }
}
