import type { IpcMainInvokeEvent } from 'electron';
import { verifyLangfuseConfigSchema, VerifyLangfuseConfigResponse } from '../../schema/core/verify-langfuse-config.schema';
import { Langfuse } from 'langfuse';
import { TRACE_NAMES, TRACE_SPAN_NAMES } from './observability.constant';

export async function verifyLangfuseConfig(event: IpcMainInvokeEvent, data: any): Promise<VerifyLangfuseConfigResponse> {
  try {
    console.log('[verify-langfuse-config] Verifying Langfuse configuration...');
    const validatedData = verifyLangfuseConfigSchema.parse(data);
    const baseUrl = validatedData.baseUrl || 'https://cloud.langfuse.com';
    const authString = Buffer.from(`${validatedData.publicKey}:${validatedData.secretKey}`).toString('base64');

    const response = await fetch(`${baseUrl}/api/public/projects`, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(response.status === 401 ? 
        'Langfuse 身份验证凭据无效' :
        `无法验证 Langfuse 配置：${response.statusText}`);
    }

    console.log('[verify-langfuse-config] Authentication successful');
    const langfuse = new Langfuse({
      publicKey: validatedData.publicKey,
      secretKey: validatedData.secretKey,
      baseUrl: validatedData.baseUrl,
    });

    const trace = langfuse.trace({
      name: TRACE_NAMES.CONFIG_VERIFICATION,
      metadata: { test: true }
    });
    
    const span = trace.span({ name: TRACE_SPAN_NAMES.CONNECTION_TEST });
    span.end();

    return {
      status: 'success',
      message: 'Langfuse 配置验证成功'
    };

  } catch (error: any) {
    console.error('[verify-langfuse-config] Error during verification:', error);
    
    return {
      status: 'failed',
      message: 'Langfuse 配置无效，请检查密钥和主机 URL。',
    };
  }
}
