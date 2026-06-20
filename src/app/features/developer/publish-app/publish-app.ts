import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../../../core/services/app.service';
import { CategoryService } from '../../../core/services/category.service';
import { UploadService } from '../../../core/services/upload.service';
import { AppCategory, AppCreatePayload, AppLicenseType, AppPricingModel, SupportedPlatform } from '../../../core/models/app.model';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { resolveAssetUrl } from '../../../core/utils/asset-url.util';

const TARGET_AUDIENCES = ['Particuliers', 'Petites entreprises', 'Grandes entreprises', 'Gouvernement'];
// Le backend valide app_type contre une liste fixe de slugs (pas les libellés
// français) — "web" est confirmé valide (apps existantes), les autres sont
// les candidats les plus probables à vérifier en testant la publication.
const APP_TYPES: { value: string; label: string }[] = [
  { value: 'mobile', label: 'Application mobile' },
  { value: 'web', label: 'Application web' },
  { value: 'desktop', label: 'Application desktop' },
  { value: 'saas', label: 'SaaS / Cloud' },
  { value: 'api', label: 'API / Service' },
  { value: 'plugin', label: 'Plugin / Extension' },
  { value: 'template', label: 'Template / Modèle' },
];
const PLATFORMS: SupportedPlatform[] = ['web', 'android', 'iOS'];
const LICENSE_TYPES: { value: AppLicenseType; label: string }[] = [
  { value: 'free', label: 'Gratuit' },
  { value: 'one_time', label: 'Achat unique' },
  { value: 'monthly', label: 'Abonnement mensuel' },
  { value: 'yearly', label: 'Abonnement annuel' },
];
const BUSINESS_SECTORS = ['Commerce', 'Services', 'Industrie', 'Santé', 'Éducation', 'Agriculture'];
const SUPPORT_OPTIONS = ['Email', 'Téléphone', 'Chat en ligne', 'Formation', 'Documentation'];

@Component({
  selector: 'app-publish-app',
  imports: [FormsModule, LoadingSpinner],
  templateUrl: './publish-app.html',
  styleUrl: './publish-app.scss',
})
export class PublishApp implements OnInit {
  readonly resolveAssetUrl = resolveAssetUrl;
  readonly targetAudiences = TARGET_AUDIENCES;
  readonly appTypes = APP_TYPES;
  readonly platforms = PLATFORMS;
  readonly licenseTypes = LICENSE_TYPES;
  readonly businessSectors = BUSINESS_SECTORS;
  readonly supportOptionsList = SUPPORT_OPTIONS;

  readonly currentStep = signal(1);
  readonly totalSteps = 4;
  readonly categories = signal<AppCategory[]>([]);
  readonly loading = signal(false);
  readonly loadingApp = signal(false);
  readonly uploadingIcon = signal(false);
  readonly uploadingScreenshots = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly stepError = signal<string | null>(null);

  private editId: number | null = null;

  appName = '';
  tagline = '';
  description = '';
  categoryId: number | null = null;
  targetAudience = '';
  iconUrl = '';
  screenshots: string[] = [];
  subcategory = '';
  tagsInput = '';

  appType = '';
  supportedPlatforms: SupportedPlatform[] = [];
  currentVersion = '1.0.0';
  technicalRequirements = '';
  languagesInput = '';

  pricingModel: AppPricingModel | '' = '';
  licenseType: AppLicenseType | '' = '';
  pricing = '';
  hasFreeTrial = false;
  trialDays: number | null = null;

  businessValue = '';
  keyFeaturesInput = '';
  selectedBusinessSectors: string[] = [];
  selectedSupportOptions: string[] = [];

  constructor(
    private appService: AppService,
    private categoryService: CategoryService,
    private uploadService: UploadService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories.set(res.data),
      error: () => this.categories.set([]),
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = Number(idParam);
      this.loadingApp.set(true);
      this.appService.getById(this.editId).subscribe({
        next: (res) => {
          const app = res.data;
          this.appName = app.app_name;
          this.tagline = app.tagline || '';
          this.description = app.description;
          this.categoryId = app.category_id;
          this.targetAudience = app.target_audience || '';
          this.iconUrl = app.icon_url || '';
          this.screenshots = app.screenshots || [];
          this.subcategory = app.subcategory || '';
          this.tagsInput = (app.tags || []).join(', ');
          this.appType = app.app_type || '';
          this.supportedPlatforms = app.supported_platforms || [];
          this.currentVersion = app.current_version || '1.0.0';
          this.technicalRequirements = app.technical_requirements || '';
          this.languagesInput = (app.languages || []).join(', ');
          this.pricingModel = app.pricing_model || '';
          this.licenseType = app.license_type || '';
          this.pricing = app.pricing || '';
          this.hasFreeTrial = app.has_free_trial;
          this.trialDays = app.trial_days;
          this.businessValue = app.business_value || '';
          this.keyFeaturesInput = (app.key_features || []).join('\n');
          this.selectedBusinessSectors = app.business_sectors || [];
          this.selectedSupportOptions = app.support_options || [];
          this.loadingApp.set(false);
        },
        error: () => {
          this.errorMessage.set("Impossible de charger l'application à modifier.");
          this.loadingApp.set(false);
        },
      });
    }
  }

  togglePlatform(platform: SupportedPlatform): void {
    const idx = this.supportedPlatforms.indexOf(platform);
    if (idx >= 0) {
      this.supportedPlatforms.splice(idx, 1);
    } else {
      this.supportedPlatforms.push(platform);
    }
  }

  toggleSector(sector: string): void {
    const idx = this.selectedBusinessSectors.indexOf(sector);
    if (idx >= 0) {
      this.selectedBusinessSectors.splice(idx, 1);
    } else {
      this.selectedBusinessSectors.push(sector);
    }
  }

  toggleSupportOption(option: string): void {
    const idx = this.selectedSupportOptions.indexOf(option);
    if (idx >= 0) {
      this.selectedSupportOptions.splice(idx, 1);
    } else {
      this.selectedSupportOptions.push(option);
    }
  }

  onIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const validationError = this.uploadService.validateFile(file);
    if (validationError) {
      this.stepError.set(validationError);
      return;
    }

    this.uploadingIcon.set(true);
    this.uploadService.uploadSingle(file).subscribe({
      next: (res) => {
        this.iconUrl = res.data.url;
        this.uploadingIcon.set(false);
      },
      error: () => {
        this.stepError.set("L'envoi de l'icône a échoué.");
        this.uploadingIcon.set(false);
      },
    });
  }

  onScreenshotsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const validationError = this.uploadService.validateFile(file);
      if (validationError) {
        this.stepError.set(validationError);
        return;
      }
    }

    this.uploadingScreenshots.set(true);
    this.uploadService.uploadMultiple(files).subscribe({
      next: (res) => {
        this.screenshots = [...this.screenshots, ...res.data.map((f) => f.url)];
        this.uploadingScreenshots.set(false);
      },
      error: () => {
        this.stepError.set("L'envoi des captures d'écran a échoué.");
        this.uploadingScreenshots.set(false);
      },
    });
  }

  removeScreenshot(url: string): void {
    this.screenshots = this.screenshots.filter((s) => s !== url);
  }

  goToStep(step: number): void {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
      this.stepError.set(null);
    }
  }

  next(): void {
    if (!this.validateStep(this.currentStep())) return;
    this.stepError.set(null);
    this.currentStep.set(Math.min(this.totalSteps, this.currentStep() + 1));
  }

  previous(): void {
    this.stepError.set(null);
    this.currentStep.set(Math.max(1, this.currentStep() - 1));
  }

  private validateStep(step: number): boolean {
    if (step === 1) {
      if (!this.appName || !this.description || !this.categoryId || !this.targetAudience) {
        this.stepError.set('Merci de remplir les champs obligatoires (*).');
        return false;
      }
    }
    if (step === 2) {
      if (!this.appType || !this.languagesInput.trim()) {
        this.stepError.set('Merci de remplir les champs obligatoires (*).');
        return false;
      }
    }
    if (step === 3) {
      if (!this.pricingModel || !this.licenseType || !this.pricing) {
        this.stepError.set('Merci de remplir les champs obligatoires (*).');
        return false;
      }
    }
    return true;
  }

  submit(): void {
    if (!this.validateStep(1) || !this.validateStep(2) || !this.validateStep(3)) {
      this.currentStep.set(1);
      return;
    }

    const payload: AppCreatePayload = {
      app_name: this.appName,
      tagline: this.tagline || undefined,
      description: this.description,
      // La colonne `detailed_description` n'a pas de valeur par défaut en base
      // (erreur SQL 1364) — il faut toujours l'envoyer, même en repli sur la
      // description courte, vu qu'il n'y a pas de champ dédié dans l'UI.
      detailed_description: this.description,
      category_id: this.categoryId!,
      subcategory: this.subcategory || undefined,
      target_audience: this.targetAudience || undefined,
      icon_url: this.iconUrl || undefined,
      screenshots: this.screenshots.length ? this.screenshots : undefined,
      app_type: this.appType || undefined,
      supported_platforms: this.supportedPlatforms.length ? this.supportedPlatforms : undefined,
      current_version: this.currentVersion || undefined,
      languages: this.splitCommas(this.languagesInput),
      pricing_model: (this.pricingModel as AppPricingModel) || undefined,
      license_type: (this.licenseType as AppLicenseType) || undefined,
      pricing: this.pricing || undefined,
      has_free_trial: this.hasFreeTrial,
      trial_days: this.hasFreeTrial ? this.trialDays ?? undefined : undefined,
      business_value: this.businessValue || undefined,
      key_features: this.splitLines(this.keyFeaturesInput),
      business_sectors: this.selectedBusinessSectors.length ? this.selectedBusinessSectors : undefined,
      support_options: this.selectedSupportOptions.length ? this.selectedSupportOptions : undefined,
      tags: this.splitCommas(this.tagsInput),
    };

    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.editId
      ? this.appService.update(this.editId, payload)
      : this.appService.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/tableau-de-bord']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || "La publication a échoué. Réessaie.");
      },
    });
  }

  private splitLines(value: string): string[] | undefined {
    const lines = value.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines.length ? lines : undefined;
  }

  private splitCommas(value: string): string[] | undefined {
    const items = value.split(',').map((t) => t.trim()).filter(Boolean);
    return items.length ? items : undefined;
  }
}
