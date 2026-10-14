import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MultiUploadComponent } from './multi-upload.component';
import { ElectronService } from '../../electron-bridge/electron.service';
import { ToasterService } from '../../services/toaster/toaster.service';

describe('多文件读取与描述导入', () => {
  let component: MultiUploadComponent;
  let input: HTMLInputElement;
  let extract: jasmine.Spy;
  let error: jasmine.Spy;

  beforeEach(() => {
    extract = jasmine.createSpy('extractDocumentText').and.callFake(async (name: string) => ({ text: `${name} 的中文正文` }));
    error = jasmine.createSpy('showError');
    TestBed.configureTestingModule({ imports: [MultiUploadComponent, NoopAnimationsModule], providers: [
      { provide: ElectronService, useValue: { extractDocumentText: extract } },
      { provide: ToasterService, useValue: { showSuccess: () => {}, showError: error } },
    ] });
    const fixture = TestBed.createComponent(MultiUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input[type="file"]');
  });

  function selection(files: File[]): Event {
    const transfer = new DataTransfer();
    files.forEach(file => transfer.items.add(file));
    input.files = transfer.files;
    return { target: input } as unknown as Event;
  }

  it('等待慢文件读完，按选择顺序一次发送完整内容，代码重选不累积旧内容', async () => {
    const first = new File(['first'], 'first.ts');
    const second = new File(['second'], 'second.ts');
    let finish!: (text: string) => void;
    spyOn(first, 'text').and.returnValue(new Promise(resolve => finish = resolve));
    const emitted: string[] = [];
    component.fileContent.subscribe(content => emitted.push(content));
    const read = component.onFileSelected(selection([first, second]));
    expect(component.isReading).toBeTrue();
    expect(emitted).toEqual([]);
    finish('first');
    await read;
    expect(emitted).toEqual(['first.ts\n\nfirst\n\nsecond.ts\n\nsecond']);
    await component.onFileSelected(selection([new File(['third'], 'third.ts')]));
    expect(component.allFilesContent).toBe('third.ts\n\nthird');
    expect(component.files).toEqual(['third.ts']);
    expect(component.isReading).toBeFalse();
  });

  it('文档传递二进制给本地解析器，支持多选、继续添加和移除', async () => {
    component.documents = true;
    const word = new File([new Uint8Array([80, 75, 3, 4])], '说明.docx');
    await component.onFileSelected(selection([word, new File(['PDF'], '补充.pdf')]));
    expect(extract.calls.first().args[1]).toEqual(new Uint8Array([80, 75, 3, 4]));
    await component.onFileSelected(selection([new File(['text'], '需求.md')]));
    expect(component.files).toEqual(['说明.docx', '补充.pdf', '需求.md']);
    let content = '';
    component.fileContent.subscribe(value => content = value);
    component.removeFile(1);
    expect(component.files).toEqual(['说明.docx', '需求.md']);
    expect(content).toContain('说明.docx 的中文正文');
    expect(content).not.toContain('补充.pdf');
    component.removeFile(0);
    component.removeFile(0);
    expect(content).toBe('');
  });

  it('读取失败、空文件、错误类型和超大文件不会覆盖已有内容', async () => {
    component.documents = true;
    await component.onFileSelected(selection([new File(['ok'], '已有.txt')]));
    const original = component.allFilesContent;
    extract.and.returnValue(Promise.resolve({ error: '文件已加密' }));
    await component.onFileSelected(selection([new File(['bad'], '损坏.pdf')]));
    expect(error).toHaveBeenCalledWith(jasmine.stringMatching('文件已加密'));
    await component.onFileSelected(selection([new File([], '空.txt')]));
    await component.onFileSelected(selection([new File(['bad'], '程序.exe')]));
    await component.onFileSelected(selection([new File([new Uint8Array(10 * 1024 * 1024 + 1)], '超大.pdf')]));
    expect(component.allFilesContent).toBe(original);
    expect(component.files).toEqual(['已有.txt']);
    expect(extract.calls.count()).toBe(2);
    expect(component.isReading).toBeFalse();
  });

  it('合计正文超限或份数超限时保留已有文件', async () => {
    component.documents = true;
    await component.onFileSelected(selection([new File(['ok'], '已有.txt')]));
    extract.and.returnValue(Promise.resolve({ text: '长'.repeat(200_000) }));
    await component.onFileSelected(selection([new File(['long'], '长.txt')]));
    await component.onFileSelected(selection(Array.from({ length: 10 }, (_, index) => new File(['x'], `${index}.md`))));
    expect(component.files).toEqual(['已有.txt']);
    expect(error.calls.count()).toBe(2);
  });

  it('离开页面后不发送尚未完成的文件内容', async () => {
    const file = new File(['late'], 'late.ts');
    let finish!: (text: string) => void;
    spyOn(file, 'text').and.returnValue(new Promise(resolve => finish = resolve));
    const emitted = jasmine.createSpy('fileContent');
    component.fileContent.subscribe(emitted);
    const read = component.onFileSelected(selection([file]));
    component.ngOnDestroy();
    finish('late');
    await read;
    expect(emitted).not.toHaveBeenCalled();
  });
});
