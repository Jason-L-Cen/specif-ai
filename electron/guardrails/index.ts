import {
  GuardrailsEngine,
  GuardrailsEngineResult,
  LLMMessage,
  injectionGuard,
  leakageGuard,
  piiGuard,
  secretGuard,
  SelectionType,
} from "@presidio-dev/hai-guardrails";
import { LLMHandler } from "../services/llm/llm-handler";
import {
  coerceMessageLikeToMessage,
  mapStoredMessagesToChatMessages,
} from '@langchain/core/messages';

export class GuardrailsShouldBlock extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuardrailsShouldBlock";
  }
}

export function createComprehensiveGuardrails() {
  // Injection protection with multiple tactics
  const heuristicInjectionGuard = injectionGuard(
    { roles: ['user'], selection: SelectionType.Last },
    { mode: 'heuristic', threshold: 0.8 }
  )

  const patternInjectionGuard = injectionGuard(
    { roles: ['user'], selection: SelectionType.Last },
    { mode: 'pattern', threshold: 0.8 }
  )

  // Leakage protection
  const leakageGuardrail = leakageGuard({ roles: ['user'], selection: SelectionType.Last }, { mode: 'heuristic', threshold: 0.8 })

  // PII and secret protection
  const piiGuardrail = piiGuard({ mode: 'redact' })
  const secretGuardrail = secretGuard({ mode: 'redact' })

  // Create engine with all guards
  return new GuardrailsEngine({
    guards: [
      // TODO: Enable heuristic injection guard when ready
      // heuristicInjectionGuard,
      patternInjectionGuard,
      leakageGuardrail,
      piiGuardrail,
      secretGuardrail,
    ],
  })
}

export const guardrailsEngine = createComprehensiveGuardrails();

// export const guardrailsEngine = createComprehensiveGuardrails();

export const isBlockedByGuard = (guardResult: GuardrailsEngineResult) => {
  return guardResult.messagesWithGuardResult.some((message) =>
    message.messages.some((message) => !message.passed)
  );
};

export const generateLLMMessage = (messages: string | any[]): LLMMessage[] => {
  if (typeof messages === "string") {
    return [{
      role: "user",
      content: messages,
    }];
  }
  
  if (Array.isArray(messages)) {
    return messages.map(message => {
      const type = message._getType?.() || message.role || 'user';
      return {
        role: type === 'human' ? 'user' : type === 'ai' ? 'assistant' : type,
        content: typeof message.content === 'string'
          ? message.content
          : Array.isArray(message.content)
            ? message.content.filter((part: any) => part.type === 'text').map((part: any) => part.text).join('\n')
            : message.content?.text || message.content,
        ...(message.id && { id: message.id }),
        ...(message.tool_calls && { tool_calls: message.tool_calls }),
      };
    });
  }

  throw new Error("消息格式无效");
};

type ProxyHandler<T extends LLMHandler> = {
  [K in keyof T]?: T[K] extends (...args: infer Args) => infer Return
    ? (
        originalFn: T[K],
        target: T,
        thisArg: T,
        args: Args,
        guardrailsEngine: GuardrailsEngine
      ) => Return | Promise<Return>
    : never;
};

export async function validateGuardrails(messages: string | any[]): Promise<LLMMessage[]> {
  const llmMessages = generateLLMMessage(messages);
  
  // Find messages that need validation (user messages)
  const messagesToValidate = llmMessages.filter(msg => msg.role === "user");
  
  if (messagesToValidate.length === 0) {
    return llmMessages; // No user messages to validate
  }

  // Validate only user messages
  for (const message of messagesToValidate) {
    const guardResult = await guardrailsEngine.run([message]);
    if (isBlockedByGuard(guardResult)) {
      throw new GuardrailsShouldBlock("安全护栏已拦截响应");
    }
    message.content = guardResult.messages[0].content;
  }

  return llmMessages;
}

// The guardrails package bundles different LangChain classes; preserve the installed SDK's message metadata.
export const langChainGuardrailsHandler = {
  invoke: async (
    method: (...args: any[]) => any,
    _target: object,
    thisArg: object,
    [input, options]: any[],
    engine: GuardrailsEngine,
  ) => {
    const messages = typeof input === 'string'
      ? [coerceMessageLikeToMessage(input)]
      : Array.isArray(input)
        ? input.map(coerceMessageLikeToMessage)
        : input.toChatMessages();
    const guardResult = await engine.run(generateLLMMessage(messages));
    if (isBlockedByGuard(guardResult)) throw new GuardrailsShouldBlock('安全护栏已拦截此请求');
    const stored = messages.map((message: any) => message.toDict());
    for (const [index, message] of stored.entries()) {
      if (typeof message.data.content === 'string') {
        message.data.content = guardResult.messages[index].content;
      } else {
        message.data.content = await Promise.all(message.data.content.map(async (part: any) => {
          if (part.type !== 'text') return part;
          const result = await engine.run([{ role: guardResult.messages[index].role, content: part.text }]);
          if (isBlockedByGuard(result)) throw new GuardrailsShouldBlock('安全护栏已拦截此请求');
          return { ...part, text: result.messages[0].content };
        }));
      }
    }
    return method.call(thisArg, mapStoredMessagesToChatMessages(stored), options);
  },
};

const DEFAULT_HANDLER: ProxyHandler<LLMHandler> = {
  invoke: async (method, target, thisArg, args, guardrailsEngine) => {
    const [messages, systemPrompt, operation] = args;
    const validatedMessages = await validateGuardrails(messages);
    return method.apply(thisArg, [
      validatedMessages,
      systemPrompt,
      operation,
    ]);
  },
};

export const LLMHandlerGuardrails = <T extends LLMHandler>(
  original: T,
  handler: ProxyHandler<T> = {}
): T => {
  handler = { ...DEFAULT_HANDLER, ...handler };
  return new Proxy(original, {
    get(target, prop, receiver) {
      const originalValue = Reflect.get(target, prop, receiver);
      const methodName = prop as keyof T;
      const method = originalValue as T[typeof methodName];
      const customHandler = handler?.[methodName];
      if (
        typeof originalValue !== "function" ||
        !customHandler ||
        guardrailsEngine.isDisabled
      ) {
        return originalValue;
      }
      return function (this: T, ...args: unknown[]) {
        return (async () => {
          return customHandler(
            method,
            target,
            this === receiver ? target : this,
            args,
            guardrailsEngine
          );
        })();
      };
    },
  }) as T;
};
