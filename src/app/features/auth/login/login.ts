import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ts: TranslationService
  ) {}

  submit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set(this.ts.t('login.errorFill'));
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirect || '/tableau-de-bord');
      },
      error: (err) => {
        this.loading.set(false);
        const backendMessage = err?.error?.message;
        this.errorMessage.set(
          backendMessage
            ? `${backendMessage} (${this.ts.t('login.errorBackend')})`
            : this.ts.t('login.errorCredentials')
        );
      },
    });
  }
}
