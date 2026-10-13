import {
  ContentGenerationProcess,
  ContentGenerationType,
} from "../../types/content-generation.types";

class ContentGenerationManager {
  private processes: Map<string, ContentGenerationProcess> = new Map();

  setContentGenerationStatus(
    solutionId: string,
    type: ContentGenerationType,
    isInProgress: boolean
  ): void {
    const displayNames: Record<ContentGenerationType, string> = {
      [ContentGenerationType.Solution]: "生成解决方案",
      [ContentGenerationType.Story]: "生成用户故事",
      [ContentGenerationType.Task]: "生成任务",
      [ContentGenerationType.TestCase]: "生成测试用例",
    };

    const key = `${solutionId}-${type}`;
    this.processes.set(key, {
      solutionId,
      type,
      displayName: displayNames[type],
      isInProgress,
    });
  }

  isAnyContentGenerationInProgress(): boolean {
    return Array.from(this.processes.values()).some(
      (process) => process.isInProgress
    );
  }

  getActiveContentGenerationProcesses(): ContentGenerationProcess[] {
    return Array.from(this.processes.values()).filter(
      (process) => process.isInProgress
    );
  }

  getActiveContentGenerationProcessNames(): string[] {
    return this.getActiveContentGenerationProcesses().map(
      (process) => process.displayName
    );
  }

  clearAllContentGenerationProcesses(): void {
    this.processes.clear();
  }
}

export const contentGenerationManager = new ContentGenerationManager();
