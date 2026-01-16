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
    <div class="template-list-container">
      <!-- Hero Header -->
      <div class="page-hero">
        <div class="hero-content">
          <div class="hero-badge">
            <i class="fas fa-envelope"></i>
            <span>Gestion de Templates</span>
          </div>
          <h1>Mes Templates d'E-mails</h1>
          <p class="hero-subtitle">
            Créez, gérez et organisez vos modèles d'e-mails professionnels en toute simplicité
          </p>
        </div>
        <div class="hero-actions">
          <a routerLink="/templates/new" class="btn btn-primary btn-lg">
            <i class="fas fa-plus-circle"></i>
            <span>Nouveau Template</span>
          </a>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Rechercher un template par nom ou sujet..."
            class="search-input"
          />
          <button 
            class="search-clear" 
            *ngIf="searchQuery"
            (click)="clearSearch()"
            title="Effacer la recherche">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="search-stats" *ngIf="!loading">
          <i class="fas fa-layer-group"></i>
          <span><strong>{{ total }}</strong> template(s) trouvé(s)</span>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner-wrapper">
          <div class="spinner"></div>
        </div>
        <p>Chargement de vos templates...</p>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="error">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ error }}</span>
        <button class="btn-retry" (click)="loadTemplates()">
          <i class="fas fa-redo"></i>
          Réessayer
        </button>
      </div>

      <!-- Templates Grid -->
      <div class="templates-grid" *ngIf="!loading && !error && templates.length > 0">
        <div 
          class="template-card" 
          *ngFor="let template of templates; trackBy: trackByTemplateId"
          (click)="viewTemplate(template.id)"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="card-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="card-actions">
              <button 
                class="action-btn edit" 
                (click)="editTemplate($event, template.id)"
                title="Modifier le template">
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="action-btn delete" 
                (click)="deleteTemplate($event, template.id)"
                title="Supprimer le template">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <h3 class="template-title">{{ template.nom }}</h3>
            <p class="template-subject">
              <i class="fas fa-tag"></i>
              {{ template.sujet }}
            </p>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <div class="footer-item">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formatDate(template.updated_at) }}</span>
            </div>
            <div class="version-badge">
              <i class="fas fa-code-branch"></i>
              <span>v{{ template.version_count }}</span>
            </div>
          </div>

          <!-- Hover Overlay -->
          <div class="card-overlay">
            <i class="fas fa-eye"></i>
            <span>Voir les détails</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && !error && templates.length === 0">
        <div class="empty-icon">
          <i class="fas fa-inbox"></i>
        </div>
        <h3>Aucun template trouvé</h3>
        <p *ngIf="searchQuery">
          Aucun résultat pour "{{ searchQuery }}". Essayez une autre recherche.
        </p>
        <p *ngIf="!searchQuery">
          Vous n'avez pas encore créé de template. Commencez dès maintenant !
        </p>
        <a routerLink="/templates/new" class="btn btn-primary" *ngIf="!searchQuery">
          <i class="fas fa-plus-circle"></i>
          Créer mon premier template
        </a>
        <button class="btn btn-secondary" (click)="clearSearch()" *ngIf="searchQuery">
          <i class="fas fa-redo"></i>
          Réinitialiser la recherche
        </button>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper" *ngIf="totalPages > 1 && !loading && !error">
        <button 
          class="pagination-btn" 
          (click)="previousPage()" 
          [disabled]="currentPage === 1">
          <i class="fas fa-chevron-left"></i>
          <span>Précédent</span>
        </button>
        
        <div class="pagination-info">
          <span class="page-current">Page {{ currentPage }}</span>
          <span class="page-separator">/</span>
          <span class="page-total">{{ totalPages }}</span>
        </div>
        
        <button 
          class="pagination-btn" 
          (click)="nextPage()" 
          [disabled]="currentPage === totalPages">
          <span>Suivant</span>
          <i class="fas fa-chevron-right"></i>
        </button>
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
      --border-radius-xl: 16px;
      --shadow-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
      --shadow-md: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.12);
      --shadow-xl: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .template-list-container {
      min-height: 100vh;
      background: var(--bg-secondary);
      padding-bottom: 60px;
    }

    /* Hero Section */
    .page-hero {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      padding: 60px 24px;
      margin-bottom: 40px;
      position: relative;
      overflow: hidden;
    }

    .page-hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(30px, -30px) rotate(120deg); }
      66% { transform: translate(-20px, 20px) rotate(240deg); }
    }

    .hero-content {
      max-width: 1400px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 20px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
      backdrop-filter: blur(10px);
      animation: slideInUp 0.6s ease;
    }

    .hero-badge i {
      font-size: 16px;
    }

    .page-hero h1 {
      font-size: 48px;
      font-weight: 800;
      color: white;
      margin-bottom: 16px;
      letter-spacing: -1px;
      animation: slideInUp 0.7s ease;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .hero-subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.95);
      max-width: 600px;
      margin: 0 auto 32px;
      line-height: 1.6;
      animation: slideInUp 0.8s ease;
    }

    .hero-actions {
      animation: slideInUp 0.9s ease;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Search Section */
    .search-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px 32px;
    }

    .search-wrapper {
      position: relative;
      margin-bottom: 16px;
    }

    .search-icon {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      color: var(--text-tertiary);
      pointer-events: none;
      transition: var(--transition);
    }

    .search-input {
      width: 100%;
      padding: 18px 60px 18px 56px;
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      font-size: 16px;
      font-family: inherit;
      background: white;
      color: var(--text-primary);
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
    }

    .search-input:hover {
      border-color: var(--primary-light);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
    }

    .search-input:focus ~ .search-icon {
      color: var(--primary);
    }

    .search-clear {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: var(--bg-tertiary);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);
      color: var(--text-secondary);
    }

    .search-clear:hover {
      background: var(--error);
      color: white;
      transform: translateY(-50%) rotate(90deg);
    }

    .search-stats {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 14px;
      padding: 0 4px;
    }

    .search-stats i {
      color: var(--primary);
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 80px 24px;
      color: var(--text-secondary);
    }

    .spinner-wrapper {
      margin-bottom: 24px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--border-color);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Templates Grid */
    .templates-grid {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Template Card */
    .template-card {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: 24px;
      border: 2px solid var(--border-color);
      cursor: pointer;
      transition: var(--transition);
      position: relative;
      overflow: hidden;
      animation: slideInUp 0.5s ease;
    }

    .template-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      transform: scaleX(0);
      transition: var(--transition);
    }

    .template-card:hover {
      border-color: var(--primary);
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }

    .template-card:hover::before {
      transform: scaleX(1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      box-shadow: var(--shadow-md);
    }

    .card-actions {
      display: flex;
      gap: 8px;
      opacity: 0;
      transform: translateX(10px);
      transition: var(--transition);
    }

    .template-card:hover .card-actions {
      opacity: 1;
      transform: translateX(0);
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);
      font-size: 16px;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }

    .action-btn.edit:hover {
      background: var(--primary);
      color: white;
      transform: scale(1.1);
    }

    .action-btn.delete:hover {
      background: var(--error);
      color: white;
      transform: scale(1.1);
    }

    .card-body {
      margin-bottom: 20px;
    }

    .template-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 12px;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .template-subject {
      font-size: 14px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .template-subject i {
      color: var(--primary);
      flex-shrink: 0;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }

    .footer-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-tertiary);
    }

    .footer-item i {
      font-size: 14px;
    }

    .version-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: var(--shadow-sm);
    }

    .version-badge i {
      font-size: 11px;
    }

    .card-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: white;
      opacity: 0;
      transition: var(--transition);
      border-radius: var(--border-radius-lg);
    }

    .template-card:hover .card-overlay {
      opacity: 1;
    }

    .card-overlay i {
      font-size: 48px;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .card-overlay span {
      font-weight: 600;
      font-size: 16px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      max-width: 600px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease;
    }

    .empty-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60px;
      color: var(--primary);
    }

    .empty-state h3 {
      font-size: 24px;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .empty-state p {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 24px;
      line-height: 1.6;
    }

    /* Pagination */
    .pagination-wrapper {
      max-width: 1400px;
      margin: 40px auto 0;
      padding: 0 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
    }

    .pagination-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: white;
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
    }

    .pagination-btn:hover:not(:disabled) {
      border-color: var(--primary);
      color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .pagination-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }

    .pagination-btn i {
      font-size: 14px;
    }

    .pagination-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
    }

    .page-current {
      color: var(--primary);
      font-size: 18px;
    }

    .page-separator {
      color: var(--text-tertiary);
    }

    .page-total {
      color: var(--text-secondary);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 28px;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: var(--transition);
      text-decoration: none;
      font-family: inherit;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      box-shadow: var(--shadow-md);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 2px solid var(--border-color);
    }

    .btn-secondary:hover {
      border-color: var(--primary);
      color: var(--primary);
      transform: translateY(-2px);
    }

    .btn-lg {
      padding: 16px 32px;
      font-size: 17px;
    }

    .btn i {
      font-size: 18px;
    }

    .btn-retry {
      margin-left: 16px;
      padding: 8px 16px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: var(--transition);
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-retry:hover {
      transform: scale(1.05);
    }

    /* Error Message */
    .error-message {
      max-width: 600px;
      margin: 40px auto;
      padding: 20px 24px;
      background: rgba(239, 68, 68, 0.1);
      border: 2px solid var(--error);
      border-radius: var(--border-radius-lg);
      color: #991b1b;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideInUp 0.5s ease;
    }

    .error-message i {
      font-size: 24px;
      flex-shrink: 0;
    }

    .error-message span {
      flex: 1;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-hero h1 {
        font-size: 36px;
      }

      .hero-subtitle {
        font-size: 16px;
      }

      .templates-grid {
        grid-template-columns: 1fr;
        padding: 0 16px;
      }

      .search-section {
        padding: 0 16px 24px;
      }

      .pagination-wrapper {
        padding: 0 16px;
        flex-wrap: wrap;
      }

      .pagination-btn span {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .page-hero {
        padding: 40px 16px;
      }

      .page-hero h1 {
        font-size: 28px;
      }

      .btn-lg {
        padding: 14px 24px;
        font-size: 15px;
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

    const request = this.searchQuery.trim()
      ? this.templateService.searchTemplates(this.searchQuery, this.currentPage)
      : this.templateService.getTemplates(this.currentPage);

    request.subscribe({
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

  onSearch(): void {
    this.currentPage = 1;
    this.loadTemplates();
  }

  clearSearch(): void {
    this.searchQuery = '';
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTemplates();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  formatDate(date: string): string {
    const dateObj = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  trackByTemplateId(index: number, template: EmailTemplate): number {
    return template.id;
  }
}