import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UploadService } from '../../core/services/upload.service';
import { TranslationService } from '../../core/services/translation.service';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, LoadingSpinner, TranslatePipe],
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
    private router: Router,
    private ts: TranslationService
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res) => {
        const u = res.data;
        this.name = u.name;
        this.phone = u.phone || '';
        this.companyName = u.company_name || '';
        this.website = u.website || '';
        this.bio = u.bio || '';
        this.avatarUrl = u.avatar_url || '';
        this.loading.set(false);
      },
      error: () => { this.errorMessage.set(this.ts.t('profile.errorUpdate')); this.loading.set(false); },
    });
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingAvatar.set(true);
    this.uploadService.uploadSingle(file).subscribe({
      next: (res) => { this.avatarUrl = res.data.url; this.uploadingAvatar.set(false); },
      error: () => { this.errorMessage.set(this.ts.t('profile.errorAvatar')); this.uploadingAvatar.set(false); },
    });
  }

  submit(): void {
    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.authService.updateProfile({
      name: this.name, phone: this.phone || undefined,
      company_name: this.companyName || undefined, website: this.website || undefined,
      bio: this.bio || undefined, avatar_url: this.avatarUrl || undefined,
    }).subscribe({
      next: () => { this.saving.set(false); this.successMessage.set(this.ts.t('profile.success')); },
      error: () => { this.saving.set(false); this.errorMessage.set(this.ts.t('profile.errorUpdate')); },
    });
  }

  logout(): void {
    this.authService.logout().subscribe({ next: () => this.router.navigate(['/connexion']), error: () => this.router.navigate(['/connexion']) });
  }
}
