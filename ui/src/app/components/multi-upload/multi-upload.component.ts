import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  Input,
} from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { ButtonComponent } from '../core/button/button.component';
import { ToasterService } from '../../services/toaster/toaster.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroDocument } from '@ng-icons/heroicons/outline';
import { ElectronService } from '../../electron-bridge/electron.service';

@Component({
  selector: 'app-multi-upload',
  templateUrl: './multi-upload.component.html',
  styleUrls: ['./multi-upload.component.scss'],
  standalone: true,
  imports: [NgIf, NgForOf, ButtonComponent, NgIconComponent],
  viewProviders: [provideIcons({ heroDocument })],
})
export class MultiUploadComponent implements AfterViewInit, OnDestroy {
  @Input() documents = false;
  private entries: { file: File; content: string }[] = [];
  private destroyed = false;
  isReading = false;
  readonly documentAccept = '.docx,.pdf,.txt,.md';
  readonly codeAccept = '.js,.ts,.tsx,.jsx,.html,.css,.json,.xml,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.swift';
  @Output() fileContent = new EventEmitter<string>();
  @Output() filesList = new EventEmitter<string[]>();
  @Output() loadingChange = new EventEmitter<boolean>();
  @ViewChild('fileInput') fileInput: any;

  toastService = inject(ToasterService);
  electronService = inject(ElectronService);

  get files(): string[] { return this.entries.map(entry => entry.file.name); }
  get allFilesContent(): string {
    return this.entries.map(({ file, content }) => `${file.name}\n\n${content}`).join('\n\n');
  }

  ngAfterViewInit(): void {
    this.clearFileInput();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearFileInput();
  }

  clearFileInput(): void {
    this.entries = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files || []);
    if (!selected.length || this.isReading) return;
    this.isReading = true;
    this.loadingChange.emit(true);
    try {
      if (this.documents && this.entries.length + selected.length > 10) throw new Error('最多添加 10 份描述文件。');
      for (const file of selected) {
        if (!file.size) throw new Error(`${file.name}：文件为空。`);
        if (this.documents && (!this.documentAccept.split(',').includes('.' + file.name.split('.').pop()?.toLowerCase()) || file.size > 10 * 1024 * 1024)) {
          throw new Error(`${file.name}：仅支持 DOCX、PDF、TXT、Markdown，单份不能超过 10 MB。`);
        }
      }
      const imported = [];
      // Read in order so one slow file cannot produce a partial or reordered description.
      for (const file of selected) imported.push({ file, content: await this.readFileContent(file) });
      if (this.destroyed) return;
      const entries = this.documents ? [...this.entries, ...imported] : imported;
      if (this.documents && entries.reduce((total, entry) => total + entry.content.length, 0) > 200_000) {
        throw new Error('描述文件合计正文不能超过 20 万字符。');
      }
      this.entries = entries;
      this.emitFiles();
      this.toastService.showSuccess(`已添加 ${selected.length} 份文件`);
    } catch (error) {
      if (!this.destroyed) this.toastService.showError(`本次文件未添加，已有内容已保留。${(error as Error).message}`);
    } finally {
      this.isReading = false;
      input.value = '';
      if (!this.destroyed) this.loadingChange.emit(false);
    }
  }

  async readFileContent(file: File): Promise<string> {
    if (!this.documents) return file.text();
    const result = await this.electronService.extractDocumentText(file.name, new Uint8Array(await file.arrayBuffer()));
    if (result.error || !result.text?.trim()) throw new Error(`${file.name}：${result.error || '没有可读取的正文。'}`);
    return result.text;
  }

  removeFile(index: number): void {
    if (this.isReading) return;
    this.entries.splice(index, 1);
    this.emitFiles();
  }

  private emitFiles(): void {
    this.fileContent.emit(this.allFilesContent);
    this.filesList.emit(this.files);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}
