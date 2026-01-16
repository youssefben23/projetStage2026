import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../../services/template.service';
import { EmailTemplate, TemplateVersion } from '../../../models/template.model';
import { Subject, takeUntil, debounceTime } from 'rxjs';

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="template-detail">
      <!-- En-tête avec navigation -->
      <div class="nav-bar">
        <button class="btn-back" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
          Retour
        </button>
        <div class="nav-actions">
          <button class="btn-icon" (click)="refreshAll()" title="Tout rafraîchir">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      <!-- Chargement -->
      <div class="loading-overlay" *ngIf="loading">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Chargement...</span>
        </div>
      </div>

      <!-- Erreur -->
      <div class="alert-error" *ngIf="error">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ error }}</span>
        <button class="alert-close" (click)="error = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Contenu principal -->
      <div class="detail-content" *ngIf="template && !loading">
        <!-- En-tête du template -->
        <div class="template-header">
          <div class="template-title">
            <div class="title-badge">
              <i class="fas fa-file-code"></i>
              <span>Template</span>
            </div>
            <h1>{{ template.nom }}</h1>
            <p class="template-subject">
              <i class="fas fa-envelope"></i>
              {{ template.sujet }}
            </p>
          </div>
          <div class="template-actions">
            <button class="btn btn-secondary" (click)="editTemplate()">
              <i class="fas fa-edit"></i>
              Modifier
            </button>
            <button class="btn btn-primary" (click)="duplicateTemplate()">
              <i class="fas fa-copy"></i>
              Dupliquer
            </button>
            <button class="btn btn-danger" (click)="deleteTemplate()">
              <i class="fas fa-trash"></i>
              Supprimer
            </button>
          </div>
        </div>

        <!-- Métriques du template -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-calendar-plus"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Créé le</div>
              <div class="metric-value">{{ formatDate(template.created_at) }}</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Modifié le</div>
              <div class="metric-value">{{ formatDate(template.updated_at) }}</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-code-branch"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Versions</div>
              <div class="metric-value">{{ template.version_count || 1 }}</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-code"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Caractères</div>
              <div class="metric-value">{{ getFullHtmlWithStyles().length }}</div>
            </div>
          </div>
        </div>

        <!-- Aperçu avec contrôles -->
        <div class="preview-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-eye"></i>
              <h3>Aperçu en Temps Réel</h3>
            </div>
            <div class="section-controls">
              <button class="btn-control" (click)="refreshPreview()" title="Rafraîchir l'aperçu">
                <i class="fas fa-sync-alt" [class.fa-spin]="previewLoading"></i>
              </button>
              <button class="btn-control" (click)="openPreviewInNewTab()" title="Ouvrir dans un nouvel onglet">
                <i class="fas fa-external-link-alt"></i>
              </button>
              <button class="btn-control" (click)="downloadTemplate()" title="Télécharger le template">
                <i class="fas fa-download"></i>
              </button>
            </div>
          </div>
          <div class="preview-wrapper">
            <iframe 
              #previewIframe
              class="preview-frame"
              [srcdoc]="getFullHtmlWithStyles()"
              (load)="onPreviewLoad()"
              frameborder="0"
              sandbox="allow-same-origin">
            </iframe>
            <div class="preview-loading" *ngIf="previewLoading">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Chargement de l'aperçu...</span>
            </div>
          </div>
        </div>

        <!-- Code source -->
        <div class="code-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-code"></i>
              <h3>Code Source Complet</h3>
            </div>
            <div class="section-controls">
              <div class="code-stats">
                <span class="stat-badge">
                  <i class="fas fa-file-code"></i>
                  {{ getFullHtmlWithStyles().length }} caractères
                </span>
                <span class="stat-badge">
                  <i class="fas fa-lines"></i>
                  {{ getLineCount() }} lignes
                </span>
              </div>
              <button class="btn-control" (click)="copyToClipboard()" title="Copier le code">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          <div class="code-wrapper">
            <pre class="code-block" #codeBlock><code>{{ getFullHtmlWithStyles() }}</code></pre>
            <div class="copy-success" *ngIf="copySuccess" @fadeInOut>
              <i class="fas fa-check-circle"></i>
              Code copié dans le presse-papier !
            </div>
          </div>
        </div>

        <!-- Historique des versions -->
        <div class="versions-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-history"></i>
              <h3>Historique des Versions</h3>
            </div>
            <div class="section-controls">
              <button class="btn-control" (click)="loadVersions(true)" title="Rafraîchir les versions">
                <i class="fas fa-sync-alt" [class.fa-spin]="versionsLoading"></i>
              </button>
            </div>
          </div>
          
          <div class="versions-list" *ngIf="versions.length > 0">
            <div class="version-card" *ngFor="let version of versions; trackBy: trackByVersionId">
              <div class="version-header">
                <div class="version-title">
                  <span class="version-badge">Version {{ version.version_number }}</span>
                  <span class="version-date">{{ formatDate(version.created_at) }}</span>
                </div>
                <div class="version-actions">
                  <button class="btn-icon-small" (click)="viewVersionDetails(version)" title="Voir les détails">
                    <i class="fas fa-info-circle"></i>
                  </button>
                  <button class="btn-icon-small btn-warning" (click)="restoreVersion(version.version_number)" title="Restaurer cette version">
                    <i class="fas fa-undo"></i>
                  </button>
                </div>
              </div>
              <div class="version-content" *ngIf="version.change_description">
                <p>{{ version.change_description }}</p>
              </div>
              <div class="version-footer">
                <div class="version-info">
                  <span class="info-item">
                    <i class="fas fa-user"></i>
                    {{ version.created_by || 'Système' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="versions.length === 0 && !versionsLoading">
            <i class="fas fa-inbox"></i>
            <h4>Aucune version disponible</h4>
            <p>L'historique des modifications apparaîtra ici</p>
          </div>

          <div class="loading-state" *ngIf="versionsLoading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Chargement des versions...</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --primary-light: #818cf8;
      --secondary: #8b5cf6;
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
      --text-primary: #1e293b;
      --text-secondary: #64748b;
      --text-tertiary: #94a3b8;
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --bg-tertiary: #f1f5f9;
      --border-color: #e2e8f0;
      --border-radius: 8px;
      --border-radius-lg: 12px;
      --shadow-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
      --shadow-md: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.12);
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .template-detail {
      min-height: 100vh;
      background: var(--bg-secondary);
      padding: 24px;
    }

    /* Navigation */
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 12px 20px;
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    .btn-back:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    .btn-back i {
      font-size: 16px;
    }

    .nav-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: var(--bg-tertiary);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: var(--transition);
    }

    .btn-icon:hover {
      background: var(--primary);
      color: white;
      transform: rotate(180deg);
    }

    /* Chargement */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      color: var(--primary);
    }

    .loading-spinner i {
      font-size: 48px;
    }

    .loading-spinner span {
      font-size: 16px;
      font-weight: 600;
    }

    /* Alerte erreur */
    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid var(--error);
      padding: 16px 20px;
      border-radius: var(--border-radius);
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #991b1b;
      font-weight: 500;
      animation: slideDown 0.3s ease;
    }

    .alert-error i:first-child {
      font-size: 20px;
      flex-shrink: 0;
    }

    .alert-error span {
      flex: 1;
    }

    .alert-close {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.7;
      transition: var(--transition);
    }

    .alert-close:hover {
      background: rgba(0, 0, 0, 0.1);
      opacity: 1;
    }

    /* En-tête template */
    .template-header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      padding: 32px;
      border-radius: var(--border-radius-lg);
      margin-bottom: 24px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      overflow: hidden;
    }

    .template-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .template-title {
      flex: 1;
    }

    .title-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      backdrop-filter: blur(10px);
    }

    .template-title h1 {
      margin: 0 0 8px 0;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .template-subject {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .template-actions {
      display: flex;
      gap: 12px;
    }

    /* Boutons */
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: var(--border-radius);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: inherit;
    }

    .btn-primary {
      background: white;
      color: var(--primary);
      box-shadow: var(--shadow-md);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .btn-secondary:hover {
      background: white;
      color: var(--primary);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.9);
      color: white;
    }

    .btn-danger:hover {
      background: var(--error);
      transform: translateY(-2px);
    }

    /* Métriques */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: white;
      padding: 20px;
      border-radius: var(--border-radius-lg);
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      transition: var(--transition);
    }

    .metric-card:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .metric-content {
      flex: 1;
    }

    .metric-label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 600;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }

    /* Sections */
    .preview-section,
    .code-section,
    .versions-section {
      background: white;
      border-radius: var(--border-radius-lg);
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .section-header {
      background: var(--bg-tertiary);
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-primary);
    }

    .section-title i {
      font-size: 20px;
      color: var(--primary);
    }

    .section-title h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
    }

    .section-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-control {
      background: white;
      border: 1px solid var(--border-color);
      width: 36px;
      height: 36px;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: var(--transition);
    }

    .btn-control:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .code-stats {
      display: flex;
      gap: 8px;
    }

    .stat-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: white;
      padding: 6px 12px;
      border-radius: var(--border-radius);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    /* Aperçu */
    .preview-wrapper {
      position: relative;
      min-height: 500px;
    }

    .preview-frame {
      width: 100%;
      height: 500px;
      border: none;
      background: white;
    }

    .preview-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--primary);
      z-index: 10;
    }

    /* Code */
    .code-wrapper {
      position: relative;
    }

    .code-block {
      margin: 0;
      padding: 24px;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      max-height: 600px;
      overflow: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .code-block code {
      display: block;
      font-family: inherit;
    }

    .copy-success {
      position: absolute;
      top: 20px;
      right: 20px;
      background: var(--success);
      color: white;
      padding: 8px 16px;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      animation: fadeIn 0.3s ease;
    }

    /* Versions */
    .versions-list {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .version-card {
      background: var(--bg-tertiary);
      border-radius: var(--border-radius);
      padding: 16px;
      border-left: 4px solid var(--primary);
      transition: var(--transition);
    }

    .version-card:hover {
      transform: translateX(4px);
      background: white;
      box-shadow: var(--shadow-md);
    }

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .version-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .version-badge {
      background: var(--primary);
      color: white;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
    }

    .version-date {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .version-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon-small {
      background: white;
      border: 1px solid var(--border-color);
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: var(--transition);
    }

    .btn-icon-small:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .btn-warning:hover {
      background: var(--warning);
      border-color: var(--warning);
    }

    .version-content {
      margin-bottom: 12px;
    }

    .version-content p {
      margin: 0;
      color: var(--text-primary);
      font-size: 14px;
      line-height: 1.5;
    }

    .version-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .version-info {
      display: flex;
      gap: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    /* États vides */
    .empty-state {
      padding: 60px 20px;
      text-align: center;
      color: var(--text-tertiary);
    }

    .empty-state i {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h4 {
      margin: 0 0 8px 0;
      color: var(--text-secondary);
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .loading-state {
      padding: 40px;
      text-align: center;
      color: var(--primary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .loading-state i {
      font-size: 24px;
    }

    /* Animations */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .template-detail {
        padding: 16px;
      }

      .template-header {
        flex-direction: column;
        gap: 16px;
        padding: 24px;
      }

      .template-actions {
        width: 100%;
        justify-content: stretch;
      }

      .template-actions .btn {
        flex: 1;
        justify-content: center;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .section-controls {
        width: 100%;
        justify-content: space-between;
      }

      .preview-frame {
        height: 400px;
      }
    }
  `]
})
export class TemplateDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('previewIframe') previewIframe!: ElementRef<HTMLIFrameElement>;
  @ViewChild('codeBlock') codeBlock!: ElementRef<HTMLPreElement>;

  template: EmailTemplate | null = null;
  versions: TemplateVersion[] = [];
  loading = false;
  previewLoading = false;
  versionsLoading = false;
  error = '';
  copySuccess = false;
  templateId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.templateId = +params['id'];
        this.loadTemplate();
        this.loadVersions(false);
      });
  }

  ngAfterViewInit(): void {
    // Déclenchement initial après un court délai
    setTimeout(() => this.refreshPreview(), 300);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ✅ CHARGEMENT ULTRA-PERFORMANT DU TEMPLATE
   */
  loadTemplate(): void {
    if (!this.templateId) return;

    this.loading = true;
    this.error = '';

    this.templateService.getTemplate(this.templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.template) {
            this.template = response.template;
            // Met en cache le HTML complet
            this.cacheHtmlContent();
            // Rafraîchit l'aperçu
            setTimeout(() => this.refreshPreview(), 100);
          } else {
            this.error = response.message || 'Template non trouvé';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement template:', err);
          this.error = err.status === 404 
            ? 'Template non trouvé' 
            : 'Erreur lors du chargement du template';
          this.loading = false;
        }
      });
  }

  /**
   * ✅ CHARGEMENT DES VERSIONS AVEC OPTIMISATION
   */
  loadVersions(forceRefresh = false): void {
    if (!this.templateId) return;

    this.versionsLoading = true;

    this.templateService.getTemplateVersions(this.templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.versions = response.data.versions || [];
            // Tri par version décroissante
            this.versions.sort((a, b) => b.version_number - a.version_number);
          }
          this.versionsLoading = false;
        },
        error: (err) => {
          console.error('Erreur chargement versions:', err);
          this.versions = [];
          this.versionsLoading = false;
        }
      });
  }

  /**
   * ✅ RECONSTRUCTION OPTIMISÉE DU HTML COMPLET
   */
  getFullHtmlWithStyles(): string {
    if (!this.template) return '';

    // Utilise le cache si disponible
    const cached = this.getCachedHtml();
    if (cached) return cached;

    const html = this.template.html_content || '';
    const css = this.template.css_content || '';

    // Vérifie si le HTML contient déjà une structure complète
    const hasDoctype = html.includes('<!DOCTYPE');
    const hasHtmlTag = html.includes('<html');
    const hasStyleTag = html.includes('<style>') || html.includes('<style ');

    // Cas 1: HTML déjà complet
    if ((hasDoctype || hasHtmlTag) && hasStyleTag) {
      return html;
    }

    // Cas 2: HTML avec structure mais sans style
    if (hasHtmlTag && html.includes('</head>')) {
      const styleBlock = css ? `\n  <style>\n${css}\n  </style>` : '';
      return html.replace('</head>', `${styleBlock}\n  </head>`);
    }

    // Cas 3: HTML simple (contenu body seulement)
    const styleBlock = css ? `\n    <style>\n${css}\n    </style>` : '';
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">${styleBlock}
</head>
<body>
${html}
</body>
</html>`;
  }

  /**
   * ✅ RAFRAÎCHISSEMENT DE L'APERÇU
   */
  refreshPreview(): void {
    if (!this.previewIframe || !this.template) return;

    this.previewLoading = true;
    const fullHtml = this.getFullHtmlWithStyles();
    
    // Force le rechargement
    this.previewIframe.nativeElement.srcdoc = '';
    
    setTimeout(() => {
      this.previewIframe.nativeElement.srcdoc = fullHtml;
      // Le chargement est géré par l'événement (load)
    }, 50);
  }

  /**
   * ✅ ÉVÉNEMENT: Chargement de l'iframe
   */
  onPreviewLoad(): void {
    this.previewLoading = false;
  }

  /**
   * ✅ COPIER DANS LE PRESSE-PAPIER
   */
  async copyToClipboard(): Promise<void> {
    if (!this.codeBlock) return;

    try {
      const text = this.codeBlock.nativeElement.textContent || '';
      await navigator.clipboard.writeText(text);
      
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('Erreur copie presse-papier:', err);
      // Fallback pour anciens navigateurs
      const textArea = document.createElement('textarea');
      textArea.value = this.codeBlock.nativeElement.textContent || '';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    }
  }

  /**
   * ✅ OUVIR DANS UN NOUVEL ONGLET
   */
  openPreviewInNewTab(): void {
    const fullHtml = this.getFullHtmlWithStyles();
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  }

  /**
   * ✅ TÉLÉCHARGER LE TEMPLATE
   */
  downloadTemplate(): void {
    if (!this.template) return;

    const fullHtml = this.getFullHtmlWithStyles();
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.template.nom.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * ✅ RESTAURER UNE VERSION
   */
  restoreVersion(versionNumber: number): void {
    if (!this.templateId) return;

    if (confirm(`Êtes-vous sûr de vouloir restaurer la version ${versionNumber} ?`)) {
      this.loading = true;
      
      this.templateService.restoreVersion(this.templateId, versionNumber)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadTemplate();
              this.loadVersions(true);
            } else {
              this.error = response.message || 'Erreur lors de la restauration';
            }
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Erreur lors de la restauration';
            this.loading = false;
          }
        });
    }
  }

  /**
   * ✅ SUPPRIMER LE TEMPLATE
   */
  deleteTemplate(): void {
    if (!this.templateId || !this.template) return;

    const templateName = this.template.nom;
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le template "${templateName}" ?`)) {
      this.loading = true;
      
      this.templateService.deleteTemplate(this.templateId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/templates']);
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression';
            this.loading = false;
          }
        });
    }
  }

  /**
   * ✅ UTILITAIRES
   */
  getLineCount(): number {
    const html = this.getFullHtmlWithStyles();
    return html.split('\n').length;
  }

  formatDate(date: string): string {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  }

  trackByVersionId(index: number, version: TemplateVersion): number {
    return version.id || index;
  }

  viewVersionDetails(version: TemplateVersion): void {
    const message = `Version ${version.version_number}\n\n` +
                   `Date: ${this.formatDate(version.created_at)}\n` +
                   `Description: ${version.change_description || 'Aucune description'}\n` +
                   `Auteur: ${version.created_by || 'Système'}`;
    
    alert(message);
  }

  goBack(): void {
    this.router.navigate(['/templates']);
  }

  refreshAll(): void {
    this.loadTemplate();
    this.loadVersions(true);
  }

  editTemplate(): void {
    if (this.templateId) {
      this.router.navigate(['/templates', this.templateId, 'edit']);
    }
  }

  duplicateTemplate(): void {
    if (this.templateId) {
      this.loading = true;
      
      this.templateService.duplicateTemplate(this.templateId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success && response.template) {
              this.router.navigate(['/templates', response.template.id]);
            } else {
              this.error = response.message || 'Erreur lors de la duplication';
              this.loading = false;
            }
          },
          error: (err) => {
            this.error = 'Erreur lors de la duplication';
            this.loading = false;
          }
        });
    }
  }

  /**
   * ✅ OPTIMISATION: CACHE POUR HTML
   */
  private cachedHtml: string | null = null;
  private cachedTemplateId: number | null = null;

  private cacheHtmlContent(): void {
    if (!this.template || !this.templateId) return;
    
    this.cachedHtml = this.getFullHtmlWithStyles();
    this.cachedTemplateId = this.templateId;
  }

  private getCachedHtml(): string | null {
    if (this.cachedTemplateId === this.templateId && this.cachedHtml) {
      return this.cachedHtml;
    }
    return null;
  }
}