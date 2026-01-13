import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../../services/template.service';
import { EmailTemplate } from '../../../models/template.model';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="template-list">
      <div class="header">
        <h1>Mes Templates d'E-mails</h1>
        <a routerLink="/templates/new" class="btn btn-primary">+ Nouveau Template</a>
      </div>

      <div class="search-bar">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
          placeholder="Rechercher un template..."
          class="search-input"
        />
      </div>

      <div class="loading" *ngIf="loading">Chargement...</div>

      <div class="error-message" *ngIf="error">{{ error }}</div>

      <div class="templates-grid" *ngIf="!loading && !error">
        <div class="template-card" *ngFor="let template of templates" (click)="viewTemplate(template.id)">
          <div class="template-header">
            <h3>{{ template.nom }}</h3>
            <div class="template-actions">
              <button class="btn-icon" (click)="editTemplate($event, template.id)" title="Modifier">
                ✏️
              </button>
              <button class="btn-icon" (click)="deleteTemplate($event, template.id)" title="Supprimer">
                🗑️
              </button>
            </div>
          </div>
          <p class="template-subject">{{ template.sujet }}</p>
          <div class="template-footer">
            <span class="template-date">
              Modifié le {{ formatDate(template.updated_at) }}
            </span>
            <span class="template-version">v{{ template.version_count }}</span>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && !error && templates.length === 0">
        <p>Aucun template trouvé</p>
        <a routerLink="/templates/new" class="btn btn-primary">Créer votre premier template</a>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button class="btn btn-secondary" (click)="previousPage()" [disabled]="currentPage === 1">
          Précédent
        </button>
        <span>Page {{ currentPage }} sur {{ totalPages }}</span>
        <button class="btn btn-secondary" (click)="nextPage()" [disabled]="currentPage === totalPages">
          Suivant
        </button>
      </div>
    </div>
  `,
  styles: [`
    .template-list {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header h1 {
      color: var(--text-primary);
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .search-bar {
      margin-bottom: 24px;
      position: relative;
    }

    .search-input {
      width: 100%;
      max-width: 600px;
      padding: 14px 20px 14px 48px;
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      font-size: 15px;
      background: white;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-input::before {
      content: '🔍';
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .template-card {
      background: white;
      border-radius: var(--border-radius);
      padding: 24px;
      box-shadow: var(--box-shadow);
      cursor: pointer;
      transition: var(--transition);
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .template-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
      transform: scaleX(0);
      transition: var(--transition);
    }

    .template-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--box-shadow-hover);
      border-color: var(--primary-color);
    }

    .template-card:hover::before {
      transform: scaleX(1);
    }

    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 12px;
    }

    .template-header h3 {
      margin: 0;
      color: var(--text-primary);
      flex: 1;
      font-size: 20px;
      font-weight: 700;
    }

    .template-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: var(--bg-secondary);
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 8px;
      border-radius: var(--border-radius);
      transition: var(--transition);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      background: var(--primary-color);
      color: white;
      transform: scale(1.1);
    }

    .template-subject {
      color: var(--text-secondary);
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.5;
    }

    .template-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-light);
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }

    .template-version {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 11px;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
    }

    .empty-state p {
      color: var(--text-secondary);
      font-size: 18px;
      margin-bottom: 24px;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 40px;
      padding: 20px;
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .pagination span {
      font-weight: 600;
      color: var(--text-primary);
    }

    @media (max-width: 768px) {
      .templates-grid {
        grid-template-columns: 1fr;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
      }

      .header h1 {
        font-size: 24px;
      }
    }
  `]
})
export class TemplateListComponent implements OnInit {
  templates: EmailTemplate[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  currentPage = 1;
  totalPages = 1;
  total = 0;

  constructor(
    private templateService: TemplateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.error = '';

    if (this.searchQuery.trim()) {
      this.templateService.searchTemplates(this.searchQuery, this.currentPage).subscribe({
        next: (response) => {
          if (response.success) {
            this.templates = response.data.templates;
            this.totalPages = response.data.pages;
            this.total = response.data.total;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des templates';
          this.loading = false;
        }
      });
    } else {
      this.templateService.getTemplates(this.currentPage).subscribe({
        next: (response) => {
          if (response.success) {
            this.templates = response.data.templates;
            this.totalPages = response.data.pages;
            this.total = response.data.total;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des templates';
          this.loading = false;
        }
      });
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadTemplates();
  }

  viewTemplate(id: number): void {
    this.router.navigate(['/templates', id]);
  }

  editTemplate(event: Event, id: number): void {
    event.stopPropagation();
    this.router.navigate(['/templates', id, 'edit']);
  }

  deleteTemplate(event: Event, id: number): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      this.templateService.deleteTemplate(id).subscribe({
        next: () => {
          this.loadTemplates();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
        }
      });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTemplates();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTemplates();
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
