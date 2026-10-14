import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ElectronService } from 'src/app/electron-bridge/electron.service';
import { AnalyticsTracker } from 'src/app/services/analytics/analytics.interface';
import { setAnalyticsToggleState } from 'src/app/services/analytics/utils/analytics.utils';
import { I18nPipe } from '../../i18n/i18n.pipe';

@Component({
  selector: 'app-analytics-modal',
  templateUrl: './analytics-modal.component.html',
  styleUrls: ['./analytics-modal.component.scss'],
  standalone: true,
  imports: [I18nPipe],
})
export class AnalyticsModalComponent {
  constructor(
    private dialogRef: MatDialogRef<AnalyticsModalComponent>,
    private analyticsTracker: AnalyticsTracker,
    private electronService: ElectronService
  ) {}

  allowAnalytics(): void {
    setAnalyticsToggleState(true);
    this.electronService.setStoreValue('analyticsEnabled', true);
    this.analyticsTracker.initAnalytics();
    this.dialogRef.close();
  }

  denyAnalytics(): void {
    setAnalyticsToggleState(false);
    this.electronService.setStoreValue('analyticsEnabled', false);
    this.dialogRef.close();
  }
}
