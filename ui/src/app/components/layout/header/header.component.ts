import { I18nPipe } from "../../../i18n/i18n.pipe";
import { Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StartupService } from '../../../services/auth/startup.service';
import { ElectronService } from '../../../electron-bridge/electron.service';
import { environment } from '../../../../environments/environment';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { BreadcrumbsComponent } from '../../core/breadcrumbs/breadcrumbs.component';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { heroCog8Tooth } from '@ng-icons/heroicons/outline';
import { getUILanguage } from '../../../i18n/translate';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    NgIconComponent,
    NgIf,
    NgClass,
    RouterLink,
    AsyncPipe,
    MatTooltipModule,
   I18nPipe,],
  viewProviders: [provideIcons({ heroCog8Tooth })],
})
export class HeaderComponent implements OnInit, OnDestroy {
  protected themeConfiguration = environment.ThemeConfiguration;
  protected isEnglish = getUILanguage() === 'en';
  protected isMacOS = false;
  protected isFullscreen = false;

  startupService = inject(StartupService);
  router = inject(Router);
  private ngZone = inject(NgZone);
  private electronService = inject(ElectronService);

  ngOnInit() {
    this.isMacOS = this.electronService.getPlatform() === 'darwin';

    this.electronService.onFullscreenChange((isFullscreen: boolean) => {
      this.ngZone.run(() => {
        this.isFullscreen = isFullscreen;
      });
    });

    this.electronService.getFullscreenState().then((isFullscreen: boolean) => {
      this.ngZone.run(() => {
        this.isFullscreen = isFullscreen;
      });
    });
  }

  ngOnDestroy() {
    this.electronService.removeFullscreenListener();
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }
}
