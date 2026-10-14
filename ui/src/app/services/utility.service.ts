import { t as uiText } from "../i18n/translate";
import { RequirementTypeEnum } from '../model/enum/requirement-type.enum';

export class UtilityService {
  /**
   * Returns the expansion of the requirement type abbreviation.
   * @param abbreviation
   * @returns
   */
  expandRequirementName(abbreviation: string): string {
    if (!abbreviation) {
      return abbreviation;
    }
    const match = abbreviation.match(/([A-Z]+)(\d+)/);
    if (!match) {
      return abbreviation;
    }
    const [_, prefix, number] = match;
    switch (prefix) {
      case RequirementTypeEnum.BRD:
        return uiText("业务需求 {0}", [number]);
      case RequirementTypeEnum.PRD:
        return uiText("产品需求 {0}", [number]);
      case RequirementTypeEnum.NFR:
        return uiText("非功能需求 {0}", [number]);
      case RequirementTypeEnum.UIR:
        return uiText("用户界面需求 {0}", [number]);
      case RequirementTypeEnum.BP:
        return uiText("业务流程 {0}", [number]);
      default:
        return `${abbreviation}`;
    }
  }

  getRequirementType(abbreviation: string): string {
    const match = abbreviation.match(/([A-Z]+)(\d+)/);
    if (!match) {
      return abbreviation;
    }
    const [_, prefix, number] = match;
    return prefix;
  }

  getProductRequirements(
    rd: any,
    directContent: boolean = false,
    fontWeight: string = 'font-bold',
  ): string {
    let key = '';
    let fullText = '';
    if (!directContent) {
      key = this.getKeys(rd)[0];
      fullText = rd[key];
    } else {
      fullText = rd;
    }

    let productRequirements = '';
    let screensText = '';
    let personasText = '';

    if (/Screens[:：]|界面[:：]/.test(fullText)) {
      [productRequirements, fullText] = fullText.split(/Screens[:：]|界面[:：]/);
    } else {
      productRequirements = fullText;
    }

    if (/Personas[:：]|用户画像[:：]/.test(fullText)) {
      [screensText, personasText] = fullText.split(/Personas[:：]|用户画像[:：]/);
    } else {
      screensText = fullText;
    }

    let details = `${productRequirements.trim()}`;

    if (screensText && screensText.trim() !== productRequirements.trim()) {
      details += uiText("<br><br><h3 class=\"{0} text-secondary-900 hover:text-secondary-600\">界面</h3>{1}", [fontWeight, screensText.trim()]);
    }

    if (personasText && personasText.trim()) {
      details += uiText("<br><br><h3 class=\"{0} text-secondary-900 hover:text-secondary-600\">用户画像</h3>{1}", [fontWeight, personasText.trim()]);
    }

    return details;
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
