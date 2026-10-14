import { t as uiText } from "../i18n/translate";
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStateService } from '../services/auth/user-state.service';
import { UserProfileDialogComponent } from '../components/user-profile-dialog/user-profile-dialog.component';
import { DialogService } from '../services/dialog/dialog.service';

export const UserGuard: CanActivateFn = (route, state) => {
  const userState = inject(UserStateService);
  const dialogService = inject(DialogService);

  if (!userState.isWorkingDirSet()) {
    userState.logout(
      uiText("请选择保存目录后继续登录。"),
    );
    return false;
  }

  if (!userState.isUsernameSet()) {
    dialogService
      .createBuilder()
      .forComponent(UserProfileDialogComponent)
      .withWidth('600px')
      .disableClose()
      .open();
  }
  return true;
};

export const AuthRedirectGuard: CanActivateFn = (route, state) => {
  const userState = inject(UserStateService);
  const router = inject(Router);

  if (userState.isUsernameSet() && userState.isWorkingDirSet()) {
    router.navigate(['/apps']);
    return false;
  }

  return true;
};
