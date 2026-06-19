import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
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
    private route: ActivatedRoute
  ) {}

  submit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set('Merci de remplir tous les champs.');
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
        // "Invalid credentials" couvre aussi le cas où l'inscription n'a jamais été
        // finalisée : le compte n'existe pas tant que /verify-email n'a pas réussi.
        this.errorMessage.set(
          backendMessage
            ? `${backendMessage} (vérifie aussi que tu as bien confirmé ton email après l'inscription)`
            : 'Email ou mot de passe incorrect.'
        );
      },
    });
  }
}
