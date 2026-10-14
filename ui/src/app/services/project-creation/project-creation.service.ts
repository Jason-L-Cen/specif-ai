import { t as uiText } from "../../i18n/translate";
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { CreateProject } from '../../store/projects/projects.actions';
import { WorkflowProgressService } from '../workflow-progress/workflow-progress.service';
import { WorkflowType } from '../../model/interfaces/workflow-progress.interface';
import { ToasterService } from '../toaster/toaster.service';
import { AppSystemService } from '../app-system/app-system.service';
import { APP_CONSTANTS } from '../../constants/app.constants';
import { ICreateSolutionRequest } from 'src/app/model/interfaces/projects.interface';

export interface ProjectCreationOptions {
  projectData: ICreateSolutionRequest;
  projectName: string;
  isRetry?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectCreationService {
  private store = inject(Store);
  private workflowProgressService = inject(WorkflowProgressService);
  private toast = inject(ToasterService);
  private appSystemService = inject(AppSystemService);

  async createProject(options: ProjectCreationOptions): Promise<void> {
    const {
      projectData,
      projectName,
      isRetry = false,
      onSuccess,
      onError,
    } = options;

    const isRootDirectorySet = localStorage.getItem(APP_CONSTANTS.WORKING_DIR);
    if (!isRootDirectorySet) {
      throw new Error(uiText("请选择有效的根目录。"));
    }

    const isPathValid = await this.appSystemService.fileExists('');
    if (!isPathValid) {
      throw new Error(uiText("请选择有效的根目录。"));
    }

    await this.initializeWorkflowProgress(projectData);

    this.store
      .dispatch(new CreateProject(projectName, projectData, isRetry))
      .subscribe({
        next: async () => {
          const successMessage = isRetry
            ? uiText("解决方案 {0} 已重新创建。", [projectName])
            : uiText("解决方案 {0} 已就绪。", [projectName]);

          this.toast.showSuccess(successMessage);
          await this.handleWorkflowSuccess(projectData);
          onSuccess?.();
        },
        error: async (error) => {
          const rawMessage = error?.message || '';
          const match = rawMessage.match(/Error: .*/);
          const cleanedMessage = match ? match[0] : rawMessage;

          const errorMessage = isRetry
            ? uiText("重试创建解决方案失败：{0}", [cleanedMessage])
            : cleanedMessage;

          this.toast.showError(errorMessage);
          await this.handleWorkflowError(projectData, errorMessage);
          onError?.(error);
        },
      });
  }

  private async initializeWorkflowProgress(
    projectData: ICreateSolutionRequest,
  ): Promise<void> {
    if (!projectData.createReqt || !projectData.id) return;

    if (
      !this.workflowProgressService.hasGlobalListener(
        projectData.id,
        WorkflowType.Solution,
      )
    ) {
      this.workflowProgressService.registerGlobalListener(
        projectData.id,
        WorkflowType.Solution,
      );
    }

    await this.workflowProgressService.setCreating(
      projectData.id,
      WorkflowType.Solution,
    );
  }

  private async handleWorkflowSuccess(
    projectData: ICreateSolutionRequest,
  ): Promise<void> {
    if (!projectData.createReqt || !projectData.id) return;

    await this.workflowProgressService.setComplete(
      projectData.id,
      WorkflowType.Solution,
    );
  }

  private async handleWorkflowError(
    projectData: ICreateSolutionRequest,
    errorMessage: string,
  ): Promise<void> {
    if (!projectData.createReqt) return;

    await this.workflowProgressService.setFailed(
      projectData.id,
      WorkflowType.Solution,
      {
        timestamp: new Date().toISOString(),
        reason: errorMessage,
      },
    );
  }
}
