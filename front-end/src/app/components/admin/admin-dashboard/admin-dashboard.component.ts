import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TemplateService } from '../../../services/template.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface AdminStats {
  totalUsers: number;
  totalTemplates: number;
  totalVersions: number;
  activeUsers: number;
}

interface Activity {
  id?: number;
  action: string;
  description: string;
  created_at: string;
  user_name?: string;
}

interface Template {
  id: number;
  nom: string;
  sujet: string;
  is_active: boolean;
  updated_at: string;
  version_count: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <!-- Hero Header -->
      <div class="page-hero">
        <div class="hero-content">
          <div class="hero-badge">
            <i class="fas fa-cog"></i>
            <span>Dashboard Administrateur</span>
          </div>
          <h1>Tableau de Bord Administrateur</h1>
          <p class="hero-subtitle">
            Gestion complète de la plateforme et supervision des activités
          </p>
        </div>
        <div class="sync-indicator" [class.syncing]="isLoading">
          <span class="sync-dot"></span>
          {{ isLoading ? 'Synchronisation...' : 'Synchronisé' }}
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalUsers || 0 }}</h3>
            <p>Utilisateurs</p>
            <div class="stat-trend">
              <i class="fas fa-chart-line"></i>
              <span>Total inscrits</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalTemplates || 0 }}</h3>
            <p>Templates</p>
            <div class="stat-trend">
              <i class="fas fa-layer-group"></i>
              <span>Total créés</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">
            <i class="fas fa-code-branch"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalVersions || 0 }}</h3>
            <p>Versions</p>
            <div class="stat-trend">
              <i class="fas fa-history"></i>
              <span>Total révisions</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.activeUsers || 0 }}</h3>
            <p>Utilisateurs Actifs</p>
            <div class="stat-trend">
              <i class="fas fa-bolt"></i>
              <span>En ligne récemment</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="dashboard-content">
        <!-- Quick Actions -->
        <div class="dashboard-section">
          <div class="section-header">
            <h2><i class="fas fa-bolt"></i> Actions Rapides</h2>
          </div>
          <div class="actions-grid">
            <button class="action-card" (click)="viewUsers()">
              <div class="action-icon">
                <i class="fas fa-users-cog"></i>
              </div>
              <span class="action-text">Gérer les Utilisateurs</span>
              <span class="action-hint">Gérer comptes et permissions</span>
            </button>
            
            <button class="action-card" (click)="viewTemplates()">
              <div class="action-icon">
                <i class="fas fa-mail-bulk"></i>
              </div>
              <span class="action-text">Voir tous les Templates</span>
              <span class="action-hint">Explorer tous les templates</span>
            </button>
            
            <button class="action-card" (click)="viewLogs()">
              <div class="action-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <span class="action-text">Logs d'Activité</span>
              <span class="action-hint">Voir l'historique complet</span>
            </button>
            
            <button class="action-card" (click)="viewStatistics()">
              <div class="action-icon">
                <i class="fas fa-chart-bar"></i>
              </div>
              <span class="action-text">Statistiques</span>
              <span class="action-hint">Analyses détaillées</span>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="dashboard-section">
          <div class="section-header">
            <h2><i class="fas fa-history"></i> Activité Récente</h2>
            <button class="btn-refresh" (click)="refreshData()" [disabled]="isLoading">
              <i class="fas fa-redo" [class.fa-spin]="isLoading"></i>
              Actualiser
            </button>
          </div>
          
          <div class="activity-list" *ngIf="!isLoading && recentActivities.length > 0">
            <div class="activity-item" *ngFor="let activity of recentActivities">
              <div class="activity-icon" [class]="getActivityIconClass(activity.action)">
                <i [class]="getActivityIcon(activity.action)"></i>
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.description }}</p>
                <div class="activity-meta">
                  <span class="activity-time">
                    <i class="fas fa-clock"></i>
                    {{ formatTime(activity.created_at) }}
                  </span>
                  <span class="activity-user" *ngIf="activity.user_name">
                    <i class="fas fa-user"></i>
                    {{ activity.user_name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="loading-state" *ngIf="isLoading">
            <div class="spinner-wrapper">
              <div class="spinner"></div>
            </div>
            <p>Chargement des activités...</p>
          </div>
          
          <div class="empty-state" *ngIf="!isLoading && recentActivities.length === 0">
            <div class="empty-icon">
              <i class="fas fa-inbox"></i>
            </div>
            <h3>Aucune activité récente</h3>
            <p>Les activités apparaîtront ici au fur et à mesure</p>
          </div>
        </div>
      </div>

      <!-- Recent Templates -->
      <div class="dashboard-section full-width" *ngIf="recentTemplates.length > 0">
        <div class="section-header">
          <h2><i class="fas fa-layer-group"></i> Templates Récents</h2>
          <a routerLink="/templates" class="btn-view-all">
            <i class="fas fa-arrow-right"></i>
            Voir tous
          </a>
        </div>
        <div class="templates-grid">
          <div class="template-card" *ngFor="let template of recentTemplates" (click)="viewTemplate(template.id)">
            <div class="card-header">
              <div class="card-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <div class="card-badge" [class.active]="template.is_active">
                {{ template.is_active ? 'Actif' : 'Inactif' }}
              </div>
            </div>
            <div class="card-body">
              <h3 class="template-title">{{ template.nom }}</h3>
              <p class="template-subject">
                <i class="fas fa-tag"></i>
                {{ template.sujet }}
              </p>
            </div>
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
            <div class="card-overlay">
              <i class="fas fa-eye"></i>
              <span>Voir les détails</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="error">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ error }}</span>
        <button class="btn-retry" (click)="refreshData()">
          <i class="fas fa-redo"></i>
          Réessayer
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Variables CSS - identiques aux autres fichiers */
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

    .admin-dashboard {
      min-height: 100vh;
      background: var(--bg-secondary);
      padding-bottom: 60px;
    }

    /* Hero Section - similaire à template-list */
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

    .sync-indicator {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 20px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      animation: slideInUp 0.9s ease;
    }

    .sync-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    .sync-indicator.syncing .sync-dot {
      background: #f59e0b;
      animation: pulse-dot 0.8s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(1.2);
      }
    }

    /* Stats Grid - amélioré */
    .stats-grid {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px 40px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
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
      animation: slideInUp 0.5s ease;
      border: 2px solid var(--border-color);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
      border-color: var(--primary);
    }

    .stat-icon {
      width: 70px;
      height: 70px;
      border-radius: var(--border-radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: white;
      flex-shrink: 0;
    }

    .stat-primary .stat-icon {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    }

    .stat-success .stat-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .stat-info .stat-icon {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    }

    .stat-warning .stat-icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 4px;
      line-height: 1;
    }

    .stat-content p {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .stat-trend i {
      font-size: 11px;
    }

    /* Dashboard Content */
    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    /* Dashboard Sections */
    .dashboard-section {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-md);
      border: 2px solid var(--border-color);
      animation: fadeIn 0.6s ease;
    }

    .dashboard-section.full-width {
      grid-column: 1 / -1;
      margin-top: 24px;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Section Headers */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .section-header h2 i {
      color: var(--primary);
      font-size: 20px;
    }

    /* Buttons */
    .btn-refresh {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
    }

    .btn-refresh:hover:not(:disabled) {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      transform: translateY(-2px);
    }

    .btn-refresh:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-refresh i.fa-spin {
      animation: spin 1s linear infinite;
    }

    .btn-view-all {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--primary);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      font-size: 14px;
      transition: var(--transition);
    }

    .btn-view-all:hover {
      background: var(--primary-dark);
      transform: translateX(4px);
    }

    /* Actions Grid */
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
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border: none;
      font-family: inherit;
    }

    .action-card:hover {
      border-color: var(--primary);
      background: white;
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .action-text {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 16px;
    }

    .action-hint {
      font-size: 13px;
      color: var(--text-tertiary);
      line-height: 1.4;
    }

    /* Activity List */
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
      animation: slideInRight 0.4s ease;
    }

    .activity-item:hover {
      background: var(--bg-tertiary);
      transform: translateX(4px);
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
      flex-shrink: 0;
    }

    .activity-icon.primary { background: var(--primary); }
    .activity-icon.success { background: var(--success); }
    .activity-icon.info { background: #0ea5e9; }
    .activity-icon.warning { background: var(--warning); }
    .activity-icon.error { background: var(--error); }

    .activity-content {
      flex: 1;
    }

    .activity-text {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 6px;
      font-size: 14px;
      line-height: 1.4;
    }

    .activity-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .activity-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .activity-meta i {
      font-size: 11px;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }

    .spinner-wrapper {
      margin-bottom: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border-color);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 16px;
      background: var(--bg-tertiary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: var(--text-tertiary);
    }

    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    /* Templates Grid - similaire à template-list */
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      animation: fadeIn 0.5s ease;
    }

    /* Template Card - similaire à template-list */
    .template-card {
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      padding: 20px;
      border: 2px solid var(--border-color);
      cursor: pointer;
      transition: var(--transition);
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
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      transform: scaleX(0);
      transition: var(--transition);
    }

    .template-card:hover {
      border-color: var(--primary);
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
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
    }

    .card-badge {
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 12px;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      font-weight: 600;
    }

    .card-badge.active {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    .card-body {
      margin-bottom: 20px;
    }

    .template-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
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
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .footer-item i {
      font-size: 12px;
    }

    .version-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
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
      border-radius: var(--border-radius);
    }

    .template-card:hover .card-overlay {
      opacity: 1;
    }

    .card-overlay i {
      font-size: 32px;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .card-overlay span {
      font-weight: 600;
      font-size: 14px;
    }

    /* Error Message - similaire à template-list */
    .error-message {
      max-width: 1400px;
      margin: 24px auto;
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

    .btn-retry {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: var(--transition);
      font-weight: 600;
      font-size: 14px;
      font-family: inherit;
    }

    .btn-retry:hover {
      background: var(--primary-dark);
      transform: scale(1.05);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .page-hero h1 {
        font-size: 36px;
      }

      .hero-subtitle {
        font-size: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        padding: 0 16px 24px;
      }

      .dashboard-content {
        padding: 0 16px 24px;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .templates-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .btn-view-all {
        align-self: flex-start;
      }
    }

    @media (max-width: 480px) {
      .page-hero {
        padding: 40px 16px;
      }

      .page-hero h1 {
        font-size: 28px;
      }

      .activity-meta {
        flex-direction: column;
        gap: 8px;
      }

      .error-message {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .btn-retry {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats: AdminStats = {
    totalUsers: 0,
    totalTemplates: 0,
    totalVersions: 0,
    activeUsers: 0
  };
  
  recentActivities: Activity[] = [];
  recentTemplates: Template[] = [];
  isLoading = false;
  error = '';
  
  private refreshSubscription?: Subscription;
  private isDestroyed = false;

  constructor(
    private authService: AuthService,
    private templateService: TemplateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    
    // Auto-refresh toutes les 30 secondes
    this.refreshSubscription = interval(30000)
      .pipe(
        switchMap(() => this.loadAllData())
      )
      .subscribe({
        error: (err) => {
          if (!this.isDestroyed) {
            console.error('Erreur lors du rafraîchissement automatique:', err);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.refreshSubscription?.unsubscribe();
  }

  async loadAllData(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = '';
    
    try {
      await Promise.allSettled([
        this.loadStats(),
        this.loadRecentActivities(),
        this.loadRecentTemplates()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.error = 'Impossible de charger les données. Veuillez réessayer.';
    } finally {
      if (!this.isDestroyed) {
        this.isLoading = false;
      }
    }
  }

  async loadStats(): Promise<void> {
    try {
      // Charger les statistiques depuis l'API admin
      const adminStatsResponse = await fetch('http://localhost:5000/api/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`
        }
      });
      
      if (adminStatsResponse.ok) {
        const adminStats = await adminStatsResponse.json();
        
        if (adminStats?.success) {
          this.stats = {
            totalUsers: adminStats.statistics?.users?.total || 0,
            totalTemplates: adminStats.statistics?.templates?.total || 0,
            totalVersions: 0, // Sera calculé depuis les templates
            activeUsers: adminStats.statistics?.users?.active || 0
          };
        }
      }
      
      // Charger les statistiques des templates pour obtenir le nombre de versions
      const templatesResponse = await this.templateService.getTemplates(1, 1000).toPromise();
      if (templatesResponse?.success) {
        // Mettre à jour le nombre total de templates si non disponible
        if (this.stats.totalTemplates === 0) {
          this.stats.totalTemplates = templatesResponse.data?.total || 0;
        }
        
        // Calculer le nombre total de versions
        this.stats.totalVersions = templatesResponse.data?.templates?.reduce(
          (sum: number, t: Template) => sum + (t.version_count || 0), 0
        ) || 0;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      
      // Fallback: charger au moins les templates
      try {
        const templatesResponse = await this.templateService.getTemplates(1, 1000).toPromise();
        if (templatesResponse?.success) {
          this.stats.totalTemplates = templatesResponse.data?.total || 0;
          this.stats.totalVersions = templatesResponse.data?.templates?.reduce(
            (sum: number, t: Template) => sum + (t.version_count || 0), 0
          ) || 0;
        }
      } catch (innerError) {
        console.error('Erreur lors du chargement des templates:', innerError);
      }
    }
  }

  async loadRecentActivities(): Promise<void> {
    try {
      const response = await this.templateService.getTemplates(1, 10).toPromise();
      
      if (response?.success && response.data?.templates) {
        this.recentActivities = response.data.templates
          .sort((a: Template, b: Template) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
          .slice(0, 5)
          .map((template: Template) => ({
            action: 'TEMPLATE_UPDATED',
            description: `Modification du template "${template.nom}"`,
            created_at: template.updated_at,
            user_name: 'Administrateur'
          }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
      this.recentActivities = [];
    }
  }

  async loadRecentTemplates(): Promise<void> {
    try {
      const response = await this.templateService.getTemplates(1, 6).toPromise();
      
      if (response?.success && response.data?.templates) {
        this.recentTemplates = response.data.templates
          .sort((a: Template, b: Template) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
          .slice(0, 6);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates récents:', error);
      this.recentTemplates = [];
    }
  }

  refreshData(): void {
    this.loadAllData();
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
      'CREATE_TEMPLATE': 'fas fa-plus-circle',
      'USER_LOGIN': 'fas fa-sign-in-alt',
      'USER_REGISTERED': 'fas fa-user-plus',
      'TEMPLATE_UPDATED': 'fas fa-edit',
      'TEMPLATE_DELETED': 'fas fa-trash-alt'
    };
    return icons[action] || 'fas fa-history';
  }

  getActivityIconClass(action: string): string {
    const classes: Record<string, string> = {
      'CREATE_TEMPLATE': 'success',
      'USER_LOGIN': 'info',
      'USER_REGISTERED': 'primary',
      'TEMPLATE_UPDATED': 'warning',
      'TEMPLATE_DELETED': 'error'
    };
    return classes[action] || 'primary';
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
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days}j`;
    return activityDate.toLocaleDateString('fr-FR');
  }

  formatDate(date: string): string {
    const now = new Date();
    const dateObj = new Date(date);
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

  viewUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  viewTemplates(): void {
    this.router.navigate(['/templates']);
  }

  viewLogs(): void {
    this.router.navigate(['/admin/logs']);
  }

  viewStatistics(): void {
    this.router.navigate(['/admin/statistics']);
  }

  viewTemplate(id: number): void {
    this.router.navigate(['/templates', id]);
  }
}