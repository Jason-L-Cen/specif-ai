import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ElectronService } from '../../../electron-bridge/electron.service';
import { ListItemComponent } from './list-item.component';
import { ButtonComponent } from '../button/button.component';
import { PmoUrlService } from '../../../services/pmo-url/pmo-url.service';
import { ToasterService } from '../../../services/toaster/toaster.service';

@Component({
  standalone: true,
  imports: [ListItemComponent, ButtonComponent],
  template: `<app-list-item [payload]="story" tag="US1" (click)="destination = 'edit'">
    <div class="absolute top-4 right-4">
      <app-button buttonContent="查看任务" (click)="destination = 'tasks'" />
      <app-button buttonContent="测试用例" (click)="destination = 'tests'" />
    </div>
  </app-list-item>`,
})
class StoryCardHost {
  story = { id: 'US1', name: '示例用户故事', description: '' };
  destination = '';
}

describe('卡片操作与编辑跳转', () => {
  it('任务和测试按钮只触发自身操作，点击卡片仍进入编辑', () => {
    TestBed.configureTestingModule({
      imports: [StoryCardHost, NoopAnimationsModule],
      providers: [
        { provide: ElectronService, useValue: {} },
        { provide: PmoUrlService, useValue: {} },
        { provide: ToasterService, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(StoryCardHost);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    buttons.find(button => button.textContent?.includes('测试用例'))!.click();
    expect(fixture.componentInstance.destination).toBe('tests');
    buttons.find(button => button.textContent?.includes('查看任务'))!.click();
    expect(fixture.componentInstance.destination).toBe('tasks');
    fixture.nativeElement.querySelector('h1').click();
    expect(fixture.componentInstance.destination).toBe('edit');
  });
});
