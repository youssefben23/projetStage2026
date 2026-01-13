import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../../services/template.service';
import { EmailTemplate, TemplateVersion } from '../../../models/template.model';

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="template-detail" *ngIf="template">
      <div class="detail-header">
        <div>
          <h1>{{ template.nom }}</h1>
          <p class="template-subject">{{ template.sujet }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="editTemplate()">Modifier</button>
          <button class="btn btn-primary" (click)="duplicateTemplate()">Dupliquer</button>
          <button class="btn btn-danger" (click)="deleteTemplate()">Supprimer</button>
        </div>
      </div>

      <div class="loading" *ngIf="loading">Chargement...</div>
      <div class="error-message" *ngIf="error">{{ error }}</div>

      <div class="detail-content" *ngIf="!loading">
        <div class="detail-section">
          <h3>Informations</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Créé le:</label>
              <span>{{ formatDate(template.created_at) }}</span>
            </div>
            <div class="info-item">
              <label>Modifié le:</label>
              <span>{{ formatDate(template.updated_at) }}</span>
            </div>
            <div class="info-item">
              <label>Versions:</label>
              <span>{{ template.version_count }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Aperçu</h3>
          <div class="preview-container">
            <div class="preview-content" [innerHTML]="template.full_html || getFullHtml()"></div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Code HTML</h3>
          <pre class="code-block">{{ template.html_content }}</pre>
        </div>

        <div class="detail-section" *ngIf="template.css_content">
          <h3>Code CSS</h3>
          <pre class="code-block">{{ template.css_content }}</pre>
        </div>

        <div class="detail-section">
          <h3>Historique des Versions</h3>
          <div class="versions-list" *ngIf="versions.length > 0">
            <div class="version-item" *ngFor="let version of versions">
              <div class="version-header">
                <span class="version-number">Version {{ version.version_number }}</span>
                <span class="version-date">{{ formatDate(version.created_at) }}</span>
              </div>
              <p class="version-description" *ngIf="version.change_description">
                {{ version.change_description }}
              </p>
              <div class="version-actions">
                <button class="btn btn-secondary" (click)="viewVersion(version)">
                  Voir
                </button>
                <button class="btn btn-primary" (click)="restoreVersion(version.version_number)">
                  Restaurer
                </button>
              </div>
            </div>
          </div>
          <div class="empty-state" *ngIf="versions.length === 0">
            Aucune version disponible
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .template-detail {
      padding: 20px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }

    .detail-header h1 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .template-subject {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .detail-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .detail-section h3 {
      margin: 0 0 15px 0;
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 12px;
      margin-bottom: 5px;
    }

    .info-item span {
      color: #333;
      font-size: 14px;
    }

    .preview-container {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 20px;
      background: white;
      max-height: 600px;
      overflow: auto;
    }

    .preview-content {
      width: 100%;
    }

    .preview-content img {
      max-width: 100%;
    }

    .code-block {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      max-height: 400px;
      overflow-y: auto;
    }

    .versions-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .version-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #667eea;
    }

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .version-number {
      font-weight: bold;
      color: #667eea;
    }

    .version-date {
      color: #666;
      font-size: 12px;
    }

    .version-description {
      color: #666;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .version-actions {
      display: flex;
      gap: 10px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class TemplateDetailComponent implements OnInit {
  template: EmailTemplate | null = null;
  versions: TemplateVersion[] = [];
  loading = false;
  error = '';
  templateId: number | null = null;

  constructor(
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.templateId = +params['id'];
      this.loadTemplate();
      this.loadVersions();
    });
  }

  loadTemplate(): void {
    if (!this.templateId) return;

    this.loading = true;
    this.templateService.getTemplate(this.templateId).subscribe({
      next: (response) => {
        if (response.success && response.template) {
          this.template = response.template;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du template';
        this.loading = false;
      }
    });
  }

  loadVersions(): void {
    if (!this.templateId) return;

    this.templateService.getTemplateVersions(this.templateId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.versions = response.data.versions || [];
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des versions', err);
      }
    });
  }

  getFullHtml(): string {
    if (!this.template) return '';
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <style>${this.template.css_content || ''}</style>
      </head>
      <body>${this.template.html_content}</body>
      </html>
    `;
  }

  editTemplate(): void {
    if (this.templateId) {
      this.router.navigate(['/templates', this.templateId, 'edit']);
    }
  }

  duplicateTemplate(): void {
    if (this.templateId) {
      this.templateService.duplicateTemplate(this.templateId).subscribe({
        next: (response) => {
          if (response.success && response.template) {
            this.router.navigate(['/templates', response.template.id]);
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la duplication';
        }
      });
    }
  }

  deleteTemplate(): void {
    if (!this.templateId) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      this.templateService.deleteTemplate(this.templateId).subscribe({
        next: () => {
          this.router.navigate(['/templates']);
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
        }
      });
    }
  }

  viewVersion(version: TemplateVersion): void {
    // Afficher le contenu de la version dans une modal ou nouvelle page
    alert(`Version ${version.version_number}\n\n${version.change_description || 'Aucune description'}`);
  }

  restoreVersion(versionNumber: number): void {
    if (!this.templateId) return;

    if (confirm(`Êtes-vous sûr de vouloir restaurer la version ${versionNumber} ?`)) {
      this.templateService.restoreVersion(this.templateId, versionNumber).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTemplate();
            this.loadVersions();
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la restauration';
        }
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
