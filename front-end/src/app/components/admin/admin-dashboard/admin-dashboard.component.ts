import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TemplateService } from '../../../services/template.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>⚙️ Dashboard Administrateur</h1>
        <p class="subtitle">Gestion complète de la plateforme</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ stats.totalUsers || 0 }}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">📧</div>
          <div class="stat-content">
            <h3>{{ stats.totalTemplates || 0 }}</h3>
            <p>Templates</p>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{ stats.totalVersions || 0 }}</h3>
            <p>Versions</p>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>{{ stats.activeUsers || 0 }}</h3>
            <p>Utilisateurs Actifs</p>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="dashboard-section">
          <h2>📋 Actions Rapides</h2>
          <div class="actions-grid">
            <button class="action-card" (click)="viewUsers()">
              <span class="action-icon">👥</span>
              <span class="action-text">Gérer les Utilisateurs</span>
            </button>
            <button class="action-card" (click)="viewTemplates()">
              <span class="action-icon">📧</span>
              <span class="action-text">Voir tous les Templates</span>
            </button>
            <button class="action-card" (click)="viewLogs()">
              <span class="action-icon">📝</span>
              <span class="action-text">Logs d'Activité</span>
            </button>
            <button class="action-card" (click)="viewStatistics()">
              <span class="action-icon">📊</span>
              <span class="action-text">Statistiques</span>
            </button>
          </div>
        </div>

        <div class="dashboard-section">
          <h2>📊 Activité Récente</h2>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let activity of recentActivities">
              <div class="activity-icon">{{ getActivityIcon(activity.action) }}</div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.description }}</p>
                <span class="activity-time">{{ formatTime(activity.created_at) }}</span>
              </div>
            </div>
            <div class="empty-state" *ngIf="recentActivities.length === 0">
              <p>Aucune activité récente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 32px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
      border-radius: var(--border-radius-lg);
      color: white;
      box-shadow: var(--shadow-lg);
    }

    .dashboard-header h1 {
      font-size: 36px;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 18px;
      opacity: 0.9;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: var(--shadow-md);
      transition: var(--transition);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }

    .stat-icon {
      font-size: 48px;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius-lg);
      background: var(--bg-secondary);
    }

    .stat-primary .stat-icon {
      background: rgba(102, 126, 234, 0.1);
    }

    .stat-success .stat-icon {
      background: rgba(40, 167, 69, 0.1);
    }

    .stat-info .stat-icon {
      background: rgba(23, 162, 184, 0.1);
    }

    .stat-warning .stat-icon {
      background: rgba(255, 193, 7, 0.1);
    }

    .stat-content h3 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .stat-content p {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .dashboard-section {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-md);
    }

    .dashboard-section h2 {
      font-size: 20px;
      margin-bottom: 20px;
      color: var(--text-primary);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .action-card {
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 20px;
      cursor: pointer;
      transition: var(--transition);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .action-card:hover {
      border-color: var(--primary-color);
      background: white;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .action-icon {
      font-size: 32px;
    }

    .action-text {
      font-weight: 600;
      color: var(--text-primary);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    .activity-item:hover {
      background: var(--bg-tertiary);
    }

    .activity-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 50%;
    }

    .activity-content {
      flex: 1;
    }

    .activity-text {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .activity-time {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }

    @media (max-width: 1024px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {
    totalUsers: 0,
    totalTemplates: 0,
    totalVersions: 0,
    activeUsers: 0
  };
  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private templateService: TemplateService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentActivities();
  }

  loadStats(): void {
    // Simuler les stats (à remplacer par un vrai appel API)
    this.stats = {
      totalUsers: 12,
      totalTemplates: 45,
      totalVersions: 128,
      activeUsers: 8
    };
  }

  loadRecentActivities(): void {
    // Simuler les activités récentes
    this.recentActivities = [
      {
        action: 'CREATE_TEMPLATE',
        description: 'Nouveau template créé par Jean Dupont',
        created_at: new Date().toISOString()
      },
      {
        action: 'USER_LOGIN',
        description: 'Connexion de Marie Martin',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }

  getActivityIcon(action: string): string {
    const icons: any = {
      'CREATE_TEMPLATE': '📧',
      'USER_LOGIN': '🔐',
      'USER_REGISTERED': '👤',
      'TEMPLATE_UPDATED': '✏️',
      'TEMPLATE_DELETED': '🗑️'
    };
    return icons[action] || '📝';
  }

  formatTime(date: string): string {
    const now = new Date();
    const activityDate = new Date(date);
    const diff = now.getTime() - activityDate.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return activityDate.toLocaleDateString('fr-FR');
  }

  viewUsers(): void {
    alert('Fonctionnalité à implémenter: Gestion des utilisateurs');
  }

  viewTemplates(): void {
    window.location.href = '/templates';
  }

  viewLogs(): void {
    alert('Fonctionnalité à implémenter: Voir les logs');
  }

  viewStatistics(): void {
    alert('Fonctionnalité à implémenter: Statistiques détaillées');
  }
}
