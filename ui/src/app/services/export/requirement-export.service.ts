import { t as uiText } from "../../i18n/translate";
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
            uiText("复制{0}失败。", [REQUIREMENT_DISPLAY_NAME_MAP[requirementType as RequirementType]]),
          );
        }
        throw new Error(
          uiText("导出{0}失败。", [REQUIREMENT_DISPLAY_NAME_MAP[requirementType as RequirementType]]),
        );
      }
    } catch (error) {
      this.logger.error('Export failed:', error);
      if (options.type === 'json') {
        this.toast.showError(
          uiText("复制数据失败：{0}", [error instanceof Error ? error.message : uiText("未知错误")]),
        );
      } else {
        this.toast.showError(
          uiText("导出数据失败：{0}", [error instanceof Error ? error.message : uiText("未知错误")]),
        );
      }
      throw error;
    }
  }
}
