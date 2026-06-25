import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  name = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  phone = '';
  companyName = '';
  website = '';
  bio = '';

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private ts: TranslationService
  ) {}

  submit(): void {
    this.errorMessage.set(null);

    if (!this.name || !this.email || !this.password || !this.passwordConfirmation) {
      this.errorMessage.set(this.ts.t('register.errorFill')); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.errorMessage.set(this.ts.t('register.errorEmail')); return;
    }
    if (this.password.length < 8) {
      this.errorMessage.set(this.ts.t('register.errorPasswordLen')); return;
    }
    if (this.password !== this.passwordConfirmation) {
      this.errorMessage.set(this.ts.t('register.errorPasswordMatch')); return;
    }

    this.loading.set(true);
    this.authService.register({
      name: this.name, email: this.email, password: this.password,
      password_confirmation: this.passwordConfirmation,
      phone: this.phone || undefined, company_name: this.companyName || undefined,
      website: this.website || undefined, bio: this.bio || undefined,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/verifier-email'], {
          queryParams: { email: this.email },
          state: { name: this.name, password: this.password },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(this.extractErrorMessage(err));
      },
    });
  }

  private extractErrorMessage(err: unknown): string {
    const body = (err as { error?: { message?: string; errors?: Record<string, string[]> } })?.error;
    if (body?.errors) return Object.values(body.errors).flat().join(' ');
    return body?.message || this.ts.t('register.errorFailed');
  }
}
