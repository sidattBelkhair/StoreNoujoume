import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UploadService } from '../../core/services/upload.service';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, LoadingSpinner],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploadingAvatar = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  name = '';
  phone = '';
  companyName = '';
  website = '';
  bio = '';
  avatarUrl = '';

  constructor(
    private authService: AuthService,
    private uploadService: UploadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.applyUser(res.data);
        this.loading.set(false);
      },
      error: () => {
        const cached = this.authService.currentUser();
        if (cached) this.applyUser(cached);
        this.loading.set(false);
      },
    });
  }

  private applyUser(user: { name: string; phone: string | null; company_name: string | null; website: string | null; bio: string | null; avatar_url: string | null }): void {
    this.name = user.name;
    this.phone = user.phone || '';
    this.companyName = user.company_name || '';
    this.website = user.website || '';
    this.bio = user.bio || '';
    this.avatarUrl = user.avatar_url || '';
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const validationError = this.uploadService.validateFile(file);
    if (validationError) {
      this.errorMessage.set(validationError);
      return;
    }

    this.uploadingAvatar.set(true);
    this.uploadService.uploadSingle(file).subscribe({
      next: (res) => {
        this.avatarUrl = res.data.url;
        this.uploadingAvatar.set(false);
      },
      error: () => {
        this.errorMessage.set("L'envoi de l'avatar a échoué.");
        this.uploadingAvatar.set(false);
      },
    });
  }

  submit(): void {
    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService
      .updateProfile({
        name: this.name,
        phone: this.phone || null,
        company_name: this.companyName || null,
        website: this.website || null,
        bio: this.bio || null,
        avatar_url: this.avatarUrl || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('Profil mis à jour.');
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err?.error?.message || 'La mise à jour a échoué.');
        },
      });
  }

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => this.router.navigateByUrl('/connexion'),
      error: () => this.router.navigateByUrl('/connexion'),
    });
  }
}
