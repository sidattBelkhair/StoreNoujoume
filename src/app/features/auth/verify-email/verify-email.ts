import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-verify-email',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit {
  email = '';
  code = '';
  name = '';
  password = '';
  readonly needsManualEntry = signal(false);
  readonly loading = signal(false);
  readonly resending = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ts: TranslationService
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    const state = this.router.currentNavigation()?.extras.state || history.state;
    if (state?.name && state?.password) {
      this.name = state.name;
      this.password = state.password;
    } else {
      this.needsManualEntry.set(true);
    }
  }

  submit(): void {
    if (!this.email || !this.code || !this.name || !this.password) {
      this.errorMessage.set(this.ts.t('verify.errorFill'));
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    this.authService.verifyEmail({ email: this.email, code: this.code, name: this.name, password: this.password }).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/connexion']); },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, this.ts.t('verify.errorInvalid')));
      },
    });
  }

  private extractErrorMessage(err: unknown, fallback: string): string {
    const body = (err as { error?: { message?: string; errors?: Record<string, string[]> } })?.error;
    if (body?.errors) return Object.values(body.errors).flat().join(' ');
    return body?.message || fallback;
  }

  resend(): void {
    if (!this.email) {
      this.errorMessage.set(this.ts.t('verify.emailHint'));
      return;
    }
    this.resending.set(true);
    this.errorMessage.set(null);

    this.authService.resendVerification(this.email).subscribe({
      next: () => { this.resending.set(false); this.infoMessage.set(this.ts.t('verify.resent')); },
      error: (err) => {
        this.resending.set(false);
        this.errorMessage.set(this.extractErrorMessage(err, this.ts.t('verify.resendFailed')));
      },
    });
  }
}
