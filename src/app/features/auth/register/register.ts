import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
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
    private router: Router
  ) {}

  submit(): void {
    this.errorMessage.set(null);

    if (!this.name || !this.email || !this.password || !this.passwordConfirmation) {
      this.errorMessage.set('Merci de remplir tous les champs obligatoires.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      this.errorMessage.set('Adresse email invalide.');
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (this.password !== this.passwordConfirmation) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loading.set(true);

    this.authService
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        password_confirmation: this.passwordConfirmation,
        phone: this.phone || undefined,
        company_name: this.companyName || undefined,
        website: this.website || undefined,
        bio: this.bio || undefined,
      })
      .subscribe({
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
    if (body?.errors) {
      return Object.values(body.errors).flat().join(' ');
    }
    return body?.message || "L'inscription a échoué. Réessaie.";
  }
}
