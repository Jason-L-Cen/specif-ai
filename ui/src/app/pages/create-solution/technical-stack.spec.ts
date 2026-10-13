import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { McpIntegrationConfiguratorComponent } from '../../components/mcp-integration-configurator/mcp-integration-configurator.component';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { NGXLogger } from 'ngx-logger';
import { CreateSolutionComponent } from './create-solution.component';
import { AppSystemService } from '../../services/app-system/app-system.service';
import { ElectronService } from '../../electron-bridge/electron.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { WorkflowProgressService } from '../../services/workflow-progress/workflow-progress.service';
import { ProjectCreationService } from '../../services/project-creation/project-creation.service';
import { AppSelectComponent } from '../../components/core/app-select/app-select.component';
import { APP_CONSTANTS } from '../../constants/app.constants';
import { TechnicalStack, getTechnicalStackOptions, describeTechnicalStack } from '../../constants/technical-stack.constants';
import { of } from 'rxjs';

@Component({
  selector: 'app-mcp-integration-configurator', template: '', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: McpSettingsStub, multi: true }],
})
class McpSettingsStub implements ControlValueAccessor {
  writeValue() {}
  registerOnChange() {}
  registerOnTouched() {}
}

describe('技术栈选项目录', () => {
  it('每个可选架构、语言和框架都能形成有明确标签的完整技术说明', () => {
    const stack: TechnicalStack = { architecture: '', language: '', framework: '', frontend: '', database: '' };
    for (const architecture of getTechnicalStackOptions('architecture', stack)) {
      stack.architecture = architecture.value;
      for (const language of getTechnicalStackOptions('language', stack)) {
        stack.language = language.value;
        for (const framework of getTechnicalStackOptions('framework', stack)) {
          stack.framework = framework.value;
          const frontends = getTechnicalStackOptions('frontend', stack);
          const databases = getTechnicalStackOptions('database', stack);
          expect(frontends.length).toBeGreaterThan(0);
          expect(databases.length).toBeGreaterThan(0);
          expect([...frontends, ...databases].every(option => !!option.label)).toBeTrue();
          stack.frontend = frontends[0].value;
          stack.database = databases[0].value;
          const details = describeTechnicalStack(stack);
          expect(details).not.toContain('undefined');
          expect(details).toContain(language.label);
          expect(details).toContain(framework.label);
        }
      }
    }
  });
});

describe('技术细节填写与提交', () => {
  let component: CreateSolutionComponent;
  let createProject: jasmine.Spy;
  let previousDirectory: string | null;

  beforeEach(() => {
    createProject = jasmine.createSpy('createProject').and.returnValue(Promise.resolve());
    TestBed.configureTestingModule({ providers: [
      { provide: NGXLogger, useValue: {} }, { provide: Router, useValue: {} },
      { provide: Store, useValue: { dispatch: () => {}, select: () => of({}) } },
      { provide: AppSystemService, useValue: { fileExists: async () => true } },
      { provide: ElectronService, useValue: {} }, { provide: ToasterService, useValue: {} },
      { provide: DialogService, useValue: {} }, { provide: WorkflowProgressService, useValue: {} },
      { provide: ProjectCreationService, useValue: { createProject } },
    ] });
    component = TestBed.runInInjectionContext(() => new CreateSolutionComponent());
    component.ngOnInit();
    component.solutionForm.patchValue({ name: '演示方案', description: '演示说明' });
    previousDirectory = localStorage.getItem(APP_CONSTANTS.WORKING_DIR);
    localStorage.setItem(APP_CONSTANTS.WORKING_DIR, 'test-demo-directory');
  });

  afterEach(() => {
    if (previousDirectory === null) localStorage.removeItem(APP_CONSTANTS.WORKING_DIR);
    else localStorage.setItem(APP_CONSTANTS.WORKING_DIR, previousDirectory);
  });

  function chooseWebStack() {
    component.technicalStackForm.patchValue({ architecture: 'bs', language: 'java', framework: 'spring', frontend: 'vue', database: 'postgresql' });
  }

  it('初始选择未完成时不能创建，后续选项等待上级选择', () => {
    expect(component.isCreateSolutionDisabled).toBeTrue();
    expect(component.technicalStackForm.controls.language.disabled).toBeTrue();
    expect(component.technicalStackForm.controls.framework.disabled).toBeTrue();
    component.technicalStackForm.controls.architecture.setValue('bs');
    expect(component.technicalStackForm.controls.language.enabled).toBeTrue();
    expect(component.technicalStackForm.controls.framework.disabled).toBeTrue();
  });

  it('完整选择写入原有字符串字段，并用于实际创建请求', async () => {
    chooseWebStack();
    expect(component.isCreateSolutionDisabled).toBeFalse();
    await component.createSolution();
    const data = createProject.calls.mostRecent().args[0].projectData;
    expect(data.technicalDetails).toContain('B/S Web 应用');
    expect(data.technicalDetails).toContain('Spring Boot');
    expect(data.technicalDetails).toContain('Vue 3');
    expect(data.technicalDetails).toContain('PostgreSQL');
    expect(data.technicalStackForm).toBeUndefined();
    expect(data.technicalDetailsMode).toBeUndefined();
  });

  it('架构变化清除不适用的框架、前端和数据库', () => {
    chooseWebStack();
    component.technicalStackForm.controls.architecture.setValue('cs');
    expect(component.technicalStackForm.controls.language.value).toBe('java');
    expect(component.technicalStackForm.controls.framework.value).toBe('');
    expect(component.technicalStackForm.controls.frontend.value).toBe('');
    expect(component.technicalStackForm.controls.database.value).toBe('');
    expect(component.solutionForm.get('technicalDetails')?.value).toBe('');
    expect(component.isCreateSolutionDisabled).toBeTrue();
  });

  it('语言变化清除旧框架，框架变化清除不适用的数据库', () => {
    chooseWebStack();
    component.technicalStackForm.controls.language.setValue('python');
    expect(component.technicalStackForm.controls.framework.value).toBe('');
    expect(component.getTechnicalOptions('framework').map(option => option.value)).toContain('django');
    component.technicalStackForm.patchValue({ framework: 'fastapi', frontend: 'react', database: 'mongodb' });
    component.technicalStackForm.controls.framework.setValue('django');
    expect(component.technicalStackForm.controls.database.value).toBe('');
    expect(component.getTechnicalOptions('database').some(option => option.value === 'mongodb')).toBeFalse();
  });

  it('API 服务自动采用无前端，允许不使用数据库', () => {
    component.technicalStackForm.patchValue({ architecture: 'api', language: 'csharp', database: 'none' });
    expect(component.technicalStackForm.controls.framework.value).toBe('aspnet');
    expect(component.technicalStackForm.controls.frontend.value).toBe('no-frontend');
    expect(component.isCreateSolutionDisabled).toBeFalse();
    expect(component.solutionForm.get('technicalDetails')?.value).toContain('不使用数据库');
  });

  it('桌面与移动框架提供原生界面，移动应用仅提供本地数据库选择', () => {
    component.technicalStackForm.patchValue({ architecture: 'cs', language: 'python', framework: 'pyside', database: 'sqlite' });
    expect(component.technicalStackForm.controls.frontend.value).toBe('native');
    expect(component.isCreateSolutionDisabled).toBeFalse();
    component.technicalStackForm.patchValue({ architecture: 'mobile', language: 'dart', database: 'sqlite' });
    expect(component.technicalStackForm.controls.framework.value).toBe('flutter');
    expect(component.getTechnicalOptions('database').map(option => option.value)).toEqual(['sqlite', 'none']);
    expect(component.solutionForm.get('technicalDetails')?.value).toContain('本地数据库：SQLite');
  });

  it('切换模式保留自定义草稿和联动选择，只提交当前模式内容', async () => {
    chooseWebStack();
    component.setTechnicalDetailsMode('custom');
    expect(component.isCreateSolutionDisabled).toBeTrue();
    const custom = '自定义：Python + FastAPI + Redis，采用内部约定的应用架构。';
    component.customTechnicalDetails.setValue(custom);
    component.setTechnicalDetailsMode('guided');
    expect(component.solutionForm.get('technicalDetails')?.value).toContain('Spring Boot');
    component.setTechnicalDetailsMode('custom');
    expect(component.solutionForm.get('technicalDetails')?.value).toBe(custom);
    await component.createSolution();
    expect(createProject.calls.mostRecent().args[0].projectData.technicalDetails).toBe(custom);
    component.customTechnicalDetails.setValue('  ');
    expect(component.isCreateSolutionDisabled).toBeTrue();
  });

  it('None 无需技术选项即可提交，并保留另外两种模式的草稿', async () => {
    component.setTechnicalDetailsMode('none');
    expect(component.isCreateSolutionDisabled).toBeFalse();
    await component.createSolution();
    const data = createProject.calls.mostRecent().args[0].projectData;
    expect(data.technicalDetails).toContain('技术选型尚未确定');
    expect(data.technicalDetails).toContain('不要假定');
    component.setTechnicalDetailsMode('guided');
    expect(component.isCreateSolutionDisabled).toBeTrue();
    chooseWebStack();
    component.setTechnicalDetailsMode('custom');
    component.customTechnicalDetails.setValue('Python + FastAPI');
    component.setTechnicalDetailsMode('none');
    expect(component.customTechnicalDetails.disabled).toBeTrue();
    component.setTechnicalDetailsMode('guided');
    expect(component.technicalStackLabel).toContain('Spring Boot');
    component.setTechnicalDetailsMode('custom');
    expect(component.customTechnicalDetails.enabled).toBeTrue();
    expect(component.solutionForm.get('technicalDetails')?.value).toBe('Python + FastAPI');
  });

  it('级联菜单浏览候选不修改已有选择，选中完整路径后才提交', () => {
    chooseWebStack();
    const original = component.solutionForm.get('technicalDetails')?.value;
    let candidate = component.nextTechnicalStack('architecture', 'mobile');
    candidate = component.nextTechnicalStack('language', 'dart', candidate);
    expect(component.getTechnicalOptions('framework', candidate).map(option => option.value)).toEqual(['flutter']);
    expect(component.solutionForm.get('technicalDetails')?.value).toBe(original);
    candidate = component.nextTechnicalStack('framework', 'flutter', candidate);
    candidate = component.nextTechnicalStack('frontend', 'native', candidate);
    candidate = component.nextTechnicalStack('database', 'sqlite', candidate);
    component.selectTechnicalStack(candidate);
    expect(component.technicalStackLabel).toContain('Flutter');
    expect(component.solutionForm.get('technicalDetails')?.value).toContain('本地数据库：SQLite');
    expect(component.solutionForm.get('technicalDetails')?.dirty).toBeTrue();
    expect(component.solutionForm.get('technicalDetails')?.touched).toBeTrue();
  });

  it('不接受不在当前选项中的技术值', () => {
    chooseWebStack();
    component.technicalStackForm.controls.framework.setValue('not-a-framework');
    expect(component.technicalStackForm.controls.framework.value).toBe('');
    expect(component.isCreateSolutionDisabled).toBeTrue();
  });

  it('仅上传文件也能提供描述，实际请求保留各份正文和来源文件名', async () => {
    component.setTechnicalDetailsMode('none');
    component.onDescriptionFiles('业务需求.docx\n\n支持审批与审计。\n\n流程说明.pdf\n\n审批通过后通知申请人。');
    expect(component.isCreateSolutionDisabled).toBeFalse();
    await component.createSolution();
    const description = createProject.calls.mostRecent().args[0].projectData.description;
    expect(description).toContain('业务需求.docx');
    expect(description).toContain('支持审批与审计。');
    expect(description).toContain('流程说明.pdf');
    expect(description).toContain('审批通过后通知申请人。');
  });

  it('添加和移除附件不会改写手动输入，移除最后一份后正确校验描述', () => {
    component.setTechnicalDetailsMode('none');
    const manual = '补充说明\n保留原有业务规则。';
    component.descriptionText.setValue(manual);
    component.onDescriptionFiles('需求.md\n\n文件正文');
    expect(component.solutionForm.get('description')?.value).toContain(manual);
    expect(component.descriptionText.value).toBe(manual);
    component.onDescriptionFiles('');
    expect(component.solutionForm.get('description')?.value).toBe(manual);
    expect(component.isCreateSolutionDisabled).toBeFalse();
    component.descriptionText.setValue('   ');
    expect(component.isCreateSolutionDisabled).toBeTrue();
  });

  it('读取期间禁止创建，读取完成后使用完整文件正文', async () => {
    chooseWebStack();
    component.descriptionImporting = true;
    expect(component.isCreateSolutionDisabled).toBeTrue();
    await component.createSolution();
    expect(createProject).not.toHaveBeenCalled();
    component.onDescriptionFiles('需求.txt\n\n完整正文');
    component.descriptionImporting = false;
    await component.createSolution();
    expect(createProject.calls.mostRecent().args[0].projectData.description).toContain('完整正文');
  });
});

describe('级联菜单与输入框交互', () => {
  it('真实模板逐级展示相容选项，取消不改变选择，最终选择关闭菜单', async () => {
    // Only the unrelated MCP configurator is omitted; the shipped form and menus are rendered.
    TestBed.configureTestingModule({ imports: [CreateSolutionComponent, NoopAnimationsModule], providers: [
      { provide: NGXLogger, useValue: {} }, { provide: Router, useValue: {} },
      { provide: Store, useValue: { dispatch: () => {}, select: () => of({}) } },
      { provide: AppSystemService, useValue: {} }, { provide: ElectronService, useValue: {} },
      { provide: ToasterService, useValue: {} }, { provide: DialogService, useValue: {} },
      { provide: WorkflowProgressService, useValue: {} }, { provide: ProjectCreationService, useValue: {} },
    ] });
    TestBed.overrideComponent(CreateSolutionComponent, {
      remove: { imports: [McpIntegrationConfiguratorComponent] },
      add: { imports: [McpSettingsStub] },
    });
    const fixture = TestBed.createComponent(CreateSolutionComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const menu = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatMenuHarness.with({ selector: '#technical-stack-selector' }));
    await menu.open();
    const architecture = (await menu.getItems({ text: '移动 App' }))[0];
    await architecture.click();
    const languages = (await architecture.getSubmenu())!;
    expect((await languages.getItems()).length).toBeGreaterThan(0);
    await menu.close();
    expect(component.technicalStackLabel).toBe('');
    await menu.clickItem({ text: '移动 App' }, { text: 'Dart' }, { text: 'Flutter' }, { text: /框架界面/ }, { text: 'SQLite' });
    expect(component.technicalStackLabel).toContain('Flutter');
    expect(await menu.isOpen()).toBeFalse();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('#technical-details');
    expect(textarea.disabled).toBeTrue();
    expect(textarea.getAttribute('aria-label')).toBe('技术细节');
    fixture.nativeElement.querySelector('input[value="custom"]').click();
    fixture.detectChanges();
    expect(textarea.disabled).toBeFalse();
    textarea.value = '自定义技术方案';
    textarea.dispatchEvent(new Event('input'));
    expect(component.solutionForm.get('technicalDetails')?.value).toBe('自定义技术方案');
    fixture.nativeElement.querySelector('input[value="none"]').click();
    fixture.detectChanges();
    expect(textarea.disabled).toBeTrue();
    expect(await menu.isDisabled()).toBeTrue();
  });
});

describe('联动下拉控件的值与可访问性', () => {
  it('选项加载后恢复已写入的值，并使用带标签的原生下拉框', () => {
    TestBed.configureTestingModule({ imports: [AppSelectComponent] });
    const fixture = TestBed.createComponent(AppSelectComponent);
    const component = fixture.componentInstance;
    component.writeValue('java');
    fixture.componentRef.setInput('label', '开发语言');
    fixture.componentRef.setInput('options', [{ value: 'java', label: 'Java' }, { value: 'python', label: 'Python' }]);
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe('java');
    expect(select.getAttribute('aria-label')).toBe('开发语言');
    const change = jasmine.createSpy('change');
    const touch = jasmine.createSpy('touch');
    component.registerOnChange(change);
    component.registerOnTouched(touch);
    select.value = 'python';
    select.dispatchEvent(new Event('change'));
    expect(change).toHaveBeenCalledWith('python');
    expect(touch).toHaveBeenCalled();
    fixture.componentRef.setInput('options', [{ value: 'java', label: 'Java' }]);
    fixture.detectChanges();
    expect(select.value).toBe('');
    expect(component.selectedOption).toBeNull();
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(select.disabled).toBeTrue();
  });
});
