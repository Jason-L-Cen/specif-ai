import { t as appText } from "../language";
import {
  ContentGenerationProcess,
  ContentGenerationType,
} from "../../types/content-generation.types";

class ContentGenerationManager {
  private processes: Map<string, ContentGenerationProcess> = new Map();

  setContentGenerationStatus(
    solutionId: string,
    type: ContentGenerationType,
    isInProgress: boolean,
    owner = 'backend'
  ): void {
    const displayNames: Record<ContentGenerationType, string> = {
      [ContentGenerationType.Solution]: appText("生成解决方案"),
      [ContentGenerationType.Story]: appText("生成用户故事"),
      [ContentGenerationType.Task]: appText("生成任务"),
      [ContentGenerationType.TestCase]: appText("生成测试用例"),
    };

    // The renderer stays active while saving generated files after the backend finishes.
    const key = `${solutionId}-${type}-${owner}`;
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
    return [...new Map(Array.from(this.processes.values())
      .filter(process => process.isInProgress)
      .map(process => [`${process.solutionId}-${process.type}`, process])).values()];
  }

  getActiveContentGenerationProcessNames(): string[] {
    return this.getActiveContentGenerationProcesses().map(
      (process) => process.displayName
    );
  }

  clearAllContentGenerationProcesses(): void {
    this.processes.clear();
  }

  clearOwner(owner: string): void {
    for (const key of this.processes.keys()) if (key.endsWith(`-${owner}`)) this.processes.delete(key);
  }
}

export const contentGenerationManager = new ContentGenerationManager();
