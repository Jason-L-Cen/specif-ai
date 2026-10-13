import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ExportRequirementDataOptions } from 'src/app/model/interfaces/exports.interface';
import { ToasterService } from '../toaster/toaster.service';
import { RequirementExportStrategyManager } from './requirement-export-strategy.manager';
import {
  REQUIREMENT_DISPLAY_NAME_MAP,
  RequirementType,
} from 'src/app/constants/app.constants';
import { IUserStory } from 'src/app/model/interfaces/IUserStory';
import { IList } from 'src/app/model/interfaces/IList';

// types

type RequirementExportInputData =
  | {
      prdId: string;
      userStories: Array<IUserStory>;
    }
  | Array<IList>;

// types

@Injectable({
  providedIn: 'root',
})
export class RequirementExportService {
  constructor(
    private strategyManager: RequirementExportStrategyManager,
    private logger: NGXLogger,
    private toast: ToasterService,
  ) {}

  public async exportRequirementData(
    data: RequirementExportInputData,
    options: ExportRequirementDataOptions & { projectName: string },
    requirementType: string,
  ): Promise<void> {
    try {
      const strategy = this.strategyManager.getStrategy(requirementType);

      const result = await strategy.export(data, {
        format: options.type,
        projectName: options.projectName,
      });

      if (!result.success) {
        if (result.error) throw result.error;
        if (options.type === 'json') {
          throw new Error(
            `复制${REQUIREMENT_DISPLAY_NAME_MAP[requirementType as RequirementType]}失败。`,
          );
        }
        throw new Error(
          `导出${REQUIREMENT_DISPLAY_NAME_MAP[requirementType as RequirementType]}失败。`,
        );
      }
    } catch (error) {
      this.logger.error('Export failed:', error);
      if (options.type === 'json') {
        this.toast.showError(
          `复制数据失败：${error instanceof Error ? error.message : '未知错误'}`,
        );
      } else {
        this.toast.showError(
          `导出数据失败：${error instanceof Error ? error.message : '未知错误'}`,
        );
      }
      throw error;
    }
  }
}
