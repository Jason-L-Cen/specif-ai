import { I18nPipe } from "../../i18n/i18n.pipe";
import { t as uiText } from "../../i18n/translate";
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { v4 as uuid } from 'uuid';
import { AddBreadcrumbs } from '../../store/breadcrumb/breadcrumb.actions';
import { NGXLogger } from 'ngx-logger';
import { DialogService } from '../../services/dialog/dialog.service';
import { AppSystemService } from '../../services/app-system/app-system.service';
import { ElectronService } from '../../electron-bridge/electron.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { NgFor, NgIf } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { NgxLoadingModule } from 'ngx-loading';
import { AppSliderComponent } from '../../components/core/slider/slider.component';
import { ButtonComponent } from '../../components/core/button/button.component';
import { ErrorMessageComponent } from '../../components/core/error-message/error-message.component';
import {
  APP_CONSTANTS,
  RootRequirementType,
  SOLUTION_CREATION_TOGGLE_MESSAGES,
  REQUIREMENT_COUNT,
} from '../../constants/app.constants';
import { InputFieldComponent } from '../../components/core/input-field/input-field.component';
import { TextareaFieldComponent } from '../../components/core/textarea-field/textarea-field.component';
import { ToggleComponent } from '../../components/toggle/toggle.component';
import { SettingsComponent } from 'src/app/components/settings/settings.component';
import { provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import { CustomAccordionComponent } from '../../components/custom-accordion/custom-accordion.component';
import { McpIntegrationConfiguratorComponent } from '../../components/mcp-integration-configurator/mcp-integration-configurator.component';
import { WorkflowProgressService } from '../../services/workflow-progress/workflow-progress.service';
import { ProjectCreationService } from '../../services/project-creation/project-creation.service';
import { MultiUploadComponent } from '../../components/multi-upload/multi-upload.component';
import {
  TechnicalStack, TECHNICAL_STACK_FIELDS, getTechnicalStackOptions, describeTechnicalStack,
} from '../../constants/technical-stack.constants';

@Component({
  selector: 'app-create-solution',
  templateUrl: './create-solution.component.html',
  styleUrls: ['./create-solution.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatMenuModule,
    ReactiveFormsModule,
    NgxLoadingModule,
    ButtonComponent,
    ErrorMessageComponent,
    InputFieldComponent,
    TextareaFieldComponent,
    ToggleComponent,
    AppSliderComponent,
    CustomAccordionComponent,
    McpIntegrationConfiguratorComponent,
    MultiUploadComponent,
   I18nPipe,],
  viewProviders: [provideIcons({ heroChevronDown })],
})
export class CreateSolutionComponent implements OnInit {
  solutionForm!: FormGroup;
  readonly descriptionText = new FormControl('', { nonNullable: true });
  private descriptionFilesContent = '';
  descriptionImporting = false;
  technicalDetailsMode: 'guided' | 'custom' | 'none' = 'guided';
  readonly customTechnicalDetails = new FormControl({ value: '', disabled: true }, {
    nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)],
  });
  readonly technicalStackForm = new FormGroup({
    architecture: new FormControl('', { nonNullable: true, validators: Validators.required }),
    language: new FormControl('', { nonNullable: true, validators: Validators.required }),
    framework: new FormControl('', { nonNullable: true, validators: Validators.required }),
    frontend: new FormControl('', { nonNullable: true, validators: Validators.required }),
    database: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  loading: boolean = false;
  addOrUpdate: boolean = false;
  
  logger = inject(NGXLogger);
  appSystemService = inject(AppSystemService);
  electronService = inject(ElectronService);
  toast = inject(ToasterService);
  readonly dialogService = inject(DialogService);
  router = inject(Router);
  store = inject(Store);
  workflowProgressService = inject(WorkflowProgressService);
  projectCreationService = inject(ProjectCreationService);

  ngOnInit() {
    this.solutionForm = this.createSolutionForm();
    this.descriptionText.valueChanges.subscribe(() => this.syncDescription());
    this.technicalStackForm.valueChanges.subscribe(() => this.syncTechnicalDetails());
    this.customTechnicalDetails.valueChanges.subscribe(value => {
      if (this.technicalDetailsMode !== 'custom') return;
      const details = this.solutionForm.get('technicalDetails')!;
      details.setValue(value);
      details.markAsDirty();
      details.markAsTouched();
    });
    this.syncTechnicalDetails();
    this.store.dispatch(
      new AddBreadcrumbs([
        {
          label: uiText("创建"),
          url: '/create',
        },
      ]),
    );
  }

  showGenerationPreferencesTab(): boolean {
    return !this.solutionForm.get('cleanSolution')?.value;
  }

  onDescriptionFiles(content: string): void {
    this.descriptionFilesContent = content;
    this.syncDescription();
  }

  get descriptionCharacterCount(): number {
    return this.solutionForm?.get('description')?.value?.length ?? 0;
  }

  private syncDescription(): void {
    const files = this.descriptionFilesContent ? uiText("参考文件正文：\n\n{0}", [this.descriptionFilesContent]) : '';
    const description = this.solutionForm.get('description')!;
    description.setValue([this.descriptionText.value, files].filter(value => !!value.trim()).join('\n\n'));
    description.markAsDirty();
    description.markAsTouched();
  }

  getTechnicalOptions(field: keyof TechnicalStack, stack = this.technicalStackForm.getRawValue()) {
    return getTechnicalStackOptions(field, stack);
  }

  trackTechnicalOption = (_: number, option: { value: string }) => option.value;

  nextTechnicalStack(field: keyof TechnicalStack, value: string, stack: TechnicalStack = {
    architecture: '', language: '', framework: '', frontend: '', database: '',
  }): TechnicalStack {
    const next = { ...stack, [field]: value };
    for (const child of TECHNICAL_STACK_FIELDS.slice(TECHNICAL_STACK_FIELDS.indexOf(field) + 1)) next[child] = '';
    return next;
  }

  selectTechnicalStack(stack: TechnicalStack) {
    this.technicalStackForm.markAsDirty();
    this.technicalStackForm.markAllAsTouched();
    this.technicalStackForm.patchValue(stack);
  }

  get technicalStackLabel(): string {
    const stack = this.technicalStackForm.getRawValue();
    if (!TECHNICAL_STACK_FIELDS.every(field => !!stack[field])) return '';
    return TECHNICAL_STACK_FIELDS.map(field => this.getTechnicalOptions(field, stack)
      .find(option => option.value === stack[field])?.label).join(' / ');
  }

  setTechnicalDetailsMode(mode: 'guided' | 'custom' | 'none') {
    if (mode === this.technicalDetailsMode) return;
    const details = this.solutionForm.get('technicalDetails')!;
    if (this.technicalDetailsMode === 'custom') this.customTechnicalDetails.setValue(details.value, { emitEvent: false });
    this.technicalDetailsMode = mode;
    if (mode === 'custom') {
      this.customTechnicalDetails.enable({ emitEvent: false });
      details.setValue(this.customTechnicalDetails.value);
    } else this.customTechnicalDetails.disable({ emitEvent: false });
    if (mode === 'none') details.setValue(uiText("暂时没有技术栈。技术选型尚未确定，请先聚焦业务需求，不要假定具体开发语言、框架、前端或数据库。"));
    else this.syncTechnicalDetails();
    details.markAsDirty();
    details.markAsUntouched();
  }

  private syncTechnicalDetails() {
    for (const field of TECHNICAL_STACK_FIELDS) {
      const control = this.technicalStackForm.controls[field];
      const options = this.getTechnicalOptions(field);
      if (!options.some(option => option.value === control.value)) {
        control.setValue(options.length === 1 ? options[0].value : '', { emitEvent: false });
      }
      if (options.length) control.enable({ emitEvent: false });
      else control.disable({ emitEvent: false });
    }
    if (this.technicalDetailsMode !== 'guided') return;
    const stack = this.technicalStackForm.getRawValue();
    const complete = TECHNICAL_STACK_FIELDS.every(field => !!stack[field]);
    const details = this.solutionForm.get('technicalDetails')!;
    details.setValue(complete ? describeTechnicalStack(stack) : '', { emitEvent: false });
    if (this.technicalStackForm.dirty) details.markAsDirty();
    if (this.technicalStackForm.touched) details.markAsTouched();
  }

  private initRequirementGroup(enabled: boolean = true, minCount: number = REQUIREMENT_COUNT.DEFAULT) {
    return {
      enabled: new FormControl(enabled),
      minCount: new FormControl(minCount, {
        validators: [
          Validators.required,
          Validators.min(0),
          Validators.max(REQUIREMENT_COUNT.MAX),
        ],
        updateOn: 'change'
      }),
    };
  }

  createSolutionForm() {
    const solutionFormGroup = new FormGroup({
      id: new FormControl(uuid()),
      name: new FormControl('', [
        Validators.required,
        Validators.pattern(/\S/),
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.pattern(/\S/),
      ]),
      technicalDetails: new FormControl('', [
        Validators.required,
        Validators.pattern(/\S/),
      ]),
      createReqt: new FormControl(true),
      createdAt: new FormControl(new Date().toISOString()),
      cleanSolution: new FormControl(false),
      BRD: new FormGroup(this.initRequirementGroup()),
      PRD: new FormGroup(this.initRequirementGroup()),
      UIR: new FormGroup(this.initRequirementGroup()),
      NFR: new FormGroup(this.initRequirementGroup()),
      mcpSettings: new FormControl({ mcpServers: {} }, [Validators.required]),
    });

    return solutionFormGroup;
  }

  onRequirementToggle(type: RootRequirementType, enabled: boolean) {
    const requirementGroup = this.solutionForm.get(type);
    if (!requirementGroup) return;
    
    // Always set a valid minCount value whether enabled or disabled
    const minCount = enabled ? REQUIREMENT_COUNT.DEFAULT : 0;
    requirementGroup.patchValue({
      enabled,
      minCount
    });
    
    // Ensure the control is marked as touched to trigger validation
    requirementGroup.get('minCount')?.markAsTouched();
    requirementGroup.get('enabled')?.markAsTouched();
    requirementGroup.updateValueAndValidity();
  }

  async createSolution() {
    if (this.descriptionImporting) return;
    let isRootDirectorySet = localStorage.getItem(APP_CONSTANTS.WORKING_DIR);
    if (isRootDirectorySet === null || isRootDirectorySet === '') {
      this.openSelectRootDirectoryModal();
      return;
    }

    let isPathValid = await this.appSystemService.fileExists('');
    if (!isPathValid) {
      this.toast.showError(uiText("请选择有效的根目录。"));
      return;
    }

    if (
      this.solutionForm.valid &&
      isRootDirectorySet !== null &&
      isRootDirectorySet !== '' &&
      isPathValid
    ) {
      this.addOrUpdate = true;
      const data = this.solutionForm.getRawValue();
      data.createReqt = !data.cleanSolution;

      try {
        await this.projectCreationService.createProject({
          projectData: data,
          projectName: data.name,
          onSuccess: () => {
            this.addOrUpdate = false;
          },
          onError: () => {
            this.addOrUpdate = false;
          },
        });
      } catch (error: any) {
        this.addOrUpdate = false;
        this.toast.showError(error.message);
      }
    }
  }

  get isCreateSolutionDisabled(): boolean {
    return this.loading || this.descriptionImporting || this.solutionForm.invalid;
  }

  openSelectRootDirectoryModal() {
    this.dialogService
      .createBuilder()
      .forComponent(SettingsComponent)
      .disableClose()
      .open();
  }

  async selectRootDirectory(): Promise<void> {
    const response = await this.electronService.openDirectory();
    this.logger.debug(response);
    if (response.length > 0) {
      localStorage.setItem(APP_CONSTANTS.WORKING_DIR, response[0]);
      await this.createSolution();
    }
  }

  get isTechnicalDetailsInvalid(): boolean {
    const field = this.solutionForm?.get('technicalDetails');
    return !!field?.invalid && (!!field?.dirty || !!field?.touched);
  }

  get isTechnicalDetailsRequiredError(): boolean {
    return this.solutionForm?.get('technicalDetails')?.hasError('required') ?? false;
  }

  canDeactivate(): boolean {
    return (
      this.solutionForm.dirty && this.solutionForm.touched && !this.addOrUpdate
    );
  }

  getSolutionToggleDescription(): string {
    return this.solutionForm.get('cleanSolution')?.value
      ? SOLUTION_CREATION_TOGGLE_MESSAGES.BROWNFIELD_SOLUTION
      : SOLUTION_CREATION_TOGGLE_MESSAGES.GREENFIELD_SOLUTION;
  }

  navigateToDashboard() {
    this.router.navigate(['/apps']);
  }

  protected readonly FormControl = FormControl;

  get isMcpSettingsInvalid(): boolean {
    const field = this.solutionForm?.get('mcpSettings');
    return !!field?.invalid && (!!field?.dirty || !!field?.touched);
  }

  get isMcpSettingsJsonInvalid(): boolean {
    return this.solutionForm?.get('mcpSettings')?.hasError('jsonInvalid') ?? false;
  }

  get isMcpSettingsSchemaInvalid(): boolean {
    return this.solutionForm?.get('mcpSettings')?.hasError('invalidMcpSettings') ?? false;
  }
}
