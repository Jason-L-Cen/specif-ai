import { FormControl } from '@angular/forms';
import { initializeUILanguage, getUILanguage, t } from './translate';
import { I18nPipe } from './i18n.pipe';
import { AppSelectComponent } from '../components/core/app-select/app-select.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { ExpandDescriptionPipe } from '../pipes/expand-description.pipe';

describe('Application language', () => {
  afterEach(async () => { localStorage.removeItem('acePda.language'); await initializeUILanguage(); });

  it('uses English or Chinese for UI text while leaving document values untouched', async () => {
    localStorage.setItem('acePda.language', 'en');
    await initializeUILanguage();
    expect(getUILanguage()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(t('创建解决方案')).toBe('Create Solution');
    expect(new ExpandDescriptionPipe().transform('BRD')).toBe('Business Requirement');
    expect(new ExpandDescriptionPipe().transform('PRD')).toBe('Product Requirement');
    expect(t('US-1: 学生接受录取')).toBe('US-1: 学生接受录取');
    expect(new I18nPipe().transform('在 {0} 中打开', ['ZenTao'])).toBe('Open in ZenTao');
    expect(new I18nPipe().transform('在 {0} 中打开', [null])).toBe('Open in ');
    localStorage.setItem('acePda.language', 'zh-CN');
    await initializeUILanguage();
    expect(t('创建解决方案')).toBe('创建解决方案');
    expect(new ExpandDescriptionPipe().transform('BRD')).toBe('业务需求');
  });

  it('keeps a dropdown closed and unchanged when it becomes disabled', () => {
    const select = new AppSelectComponent();
    const selected = { value: 'zh-CN', label: '简体中文' };
    select.options = [selected, { value: 'en', label: 'English' }];
    select.writeValue('zh-CN');
    select.showDropdown = true;
    select.disabled = true;
    const emitted = spyOn(select.selectionChange, 'emit');
    select.ngOnChanges();
    select.selectOption(select.options[1]);
    expect(select.showDropdown).toBeFalse();
    expect(select.selectedOption).toBe(selected);
    expect(emitted).not.toHaveBeenCalled();
  });

  it('does not persist a language switch while a task or unsaved settings are present', async () => {
    for (const flags of [{ languageBusy: true, hasChanges: false }, { languageBusy: false, hasChanges: true }]) {
      const save = jasmine.createSpy('setStoreValue');
      const context = { ...flags, language: 'zh-CN', languageChanging: false,
        languageControl: new FormControl('en'), electronService: { electronAPI: { setStoreValue: save } } };
      await SettingsComponent.prototype.onLanguageChange.call(context as unknown as SettingsComponent, 'en');
      expect(save).not.toHaveBeenCalled();
      expect(context.languageControl.value).toBe('zh-CN');
    }
  });

});
