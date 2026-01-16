import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Brand Section -->
        <div class="navbar-brand">
          <i class="fas fa-envelope brand-icon"></i>
          <a routerLink="/templates" class="brand-text">EmailTemplates Pro</a>
        </div>

        <!-- Navigation Links -->
        <div class="navbar-menu" *ngIf="currentUser">
          <a routerLink="/templates" routerLinkActive="active" class="nav-link">
            <i class="fas fa-th-large"></i>
            <span class="nav-text">Mes Templates</span>
          </a>
          <a routerLink="/templates/new" routerLinkActive="active" class="nav-link">
            <i class="fas fa-plus-circle"></i>
            <span class="nav-text">Nouveau</span>
          </a>
          <a routerLink="/contact" routerLinkActive="active" class="nav-link">
            <i class="fas fa-comments"></i>
            <span class="nav-text">Contact</span>
          </a>
          
          <!-- Admin Link -->
          <a routerLink="/admin" 
             routerLinkActive="active" 
             class="nav-link admin-link" 
             *ngIf="currentUser.role === 'admin'">
            <i class="fas fa-cog"></i>
            <span class="nav-text">Admin</span>
          </a>
        </div>

        <!-- User Menu or Auth Links -->
        <div class="navbar-actions">
          <!-- User Menu (when logged in) -->
          <div class="user-menu" *ngIf="currentUser">
            <div class="user-info">
              <div class="user-avatar" [title]="currentUser.full_name">
                {{ getInitials() }}
              </div>
              <span class="user-name">{{ currentUser.full_name }}</span>
            </div>
            <button class="btn btn-logout" (click)="logout()" title="Déconnexion">
              <i class="fas fa-sign-out-alt"></i>
              <span class="btn-text">Déconnexion</span>
            </button>
          </div>

          <!-- Auth Links (when not logged in) -->
          <div class="auth-links" *ngIf="!currentUser">
            <a routerLink="/login" class="nav-link">
              <i class="fas fa-sign-in-alt"></i>
              <span class="nav-text">Connexion</span>
            </a>
            <a routerLink="/register" class="btn btn-primary btn-sm">
              <i class="fas fa-user-plus"></i>
              <span>S'inscrire</span>
            </a>
          </div>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" *ngIf="currentUser">
          <i class="fas" [class.fa-bars]="!mobileMenuOpen" [class.fa-times]="mobileMenuOpen"></i>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.active]="mobileMenuOpen" *ngIf="currentUser">
        <a routerLink="/templates" 
           routerLinkActive="active" 
           class="mobile-link"
           (click)="closeMobileMenu()">
          <i class="fas fa-th-large"></i>
          <span>Mes Templates</span>
        </a>
        <a routerLink="/templates/new" 
           routerLinkActive="active" 
           class="mobile-link"
           (click)="closeMobileMenu()">
          <i class="fas fa-plus-circle"></i>
          <span>Nouveau</span>
        </a>
        <a routerLink="/contact" 
           routerLinkActive="active" 
           class="mobile-link"
           (click)="closeMobileMenu()">
          <i class="fas fa-comments"></i>
          <span>Contact</span>
        </a>
        <a routerLink="/admin" 
           routerLinkActive="active" 
           class="mobile-link admin"
           *ngIf="currentUser.role === 'admin'"
           (click)="closeMobileMenu()">
          <i class="fas fa-cog"></i>
          <span>Admin</span>
        </a>
        <button class="mobile-link logout" (click)="logout()">
          <i class="fas fa-sign-out-alt"></i>
          <span>Déconnexion</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --secondary: #8b5cf6;
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.12);
      --shadow-xl: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
    }

    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      z-index: 1000;
      box-shadow: var(--shadow-xl);
      backdrop-filter: blur(10px);
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    /* Brand Section */
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .brand-icon {
      font-size: 28px;
      color: white;
      animation: bounce 2s ease-in-out infinite;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .brand-text {
      color: white;
      text-decoration: none;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      transition: var(--transition);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .brand-text:hover {
      opacity: 0.9;
      transform: scale(1.02);
    }

    /* Navigation Menu */
    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: var(--transition);
      white-space: nowrap;
      position: relative;
      overflow: hidden;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 3px;
      background: white;
      transform: translateX(-50%);
      transition: width 0.3s ease;
      border-radius: 3px 3px 0 0;
    }

    .nav-link:hover,
    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      transform: translateY(-2px);
    }

    .nav-link:hover::before,
    .nav-link.active::before {
      width: 80%;
    }

    .nav-link i {
      font-size: 18px;
    }

    .admin-link {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .admin-link:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: white;
    }

    /* Navbar Actions */
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    /* User Menu */
    .user-menu {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-left: 20px;
      border-left: 1px solid rgba(255, 255, 255, 0.2);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.5);
      transition: var(--transition);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .user-avatar:hover {
      transform: scale(1.1);
      border-color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .user-name {
      font-weight: 600;
      font-size: 15px;
      color: white;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-logout i {
      font-size: 16px;
    }

    /* Auth Links */
    .auth-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-primary {
      background: white;
      color: var(--primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: var(--transition);
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      color: var(--primary-dark);
    }

    .btn-primary i {
      font-size: 16px;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 14px;
    }

    /* Mobile Menu Toggle */
    .mobile-menu-toggle {
      display: none;
      background: transparent;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: var(--transition);
    }

    .mobile-menu-toggle:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Mobile Menu */
    .mobile-menu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%);
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      transform: translateY(-100%);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;
    }

    .mobile-menu.active {
      transform: translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    .mobile-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      transition: var(--transition);
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
      cursor: pointer;
    }

    .mobile-link:hover,
    .mobile-link.active {
      background: rgba(255, 255, 255, 0.2);
      transform: translateX(8px);
    }

    .mobile-link i {
      font-size: 20px;
      width: 24px;
      text-align: center;
    }

    .mobile-link.admin {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .mobile-link.logout {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      margin-top: 8px;
    }

    .mobile-link.logout:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .navbar-menu {
        gap: 4px;
      }

      .nav-link {
        padding: 8px 12px;
        font-size: 14px;
      }

      .nav-link i {
        font-size: 16px;
      }

      .user-name {
        display: none;
      }

      .user-menu {
        padding-left: 16px;
        gap: 12px;
      }

      .btn-text {
        display: none;
      }

      .btn-logout {
        padding: 8px 12px;
      }
    }

    @media (max-width: 768px) {
      .navbar-container {
        padding: 12px 16px;
      }

      .navbar-menu {
        display: none;
      }

      .mobile-menu-toggle {
        display: block;
      }

      .mobile-menu {
        display: block;
      }

      .user-menu {
        border-left: none;
        padding-left: 0;
      }

      .auth-links {
        gap: 8px;
      }

      .nav-text {
        display: none;
      }

      .nav-link {
        padding: 8px;
      }

      .brand-text {
        font-size: 18px;
      }

      .brand-icon {
        font-size: 24px;
      }
    }

    @media (max-width: 480px) {
      .user-avatar {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }

      .btn-primary {
        padding: 6px 12px;
        font-size: 13px;
      }

      .btn-logout {
        padding: 6px 10px;
      }
    }

    /* Print Styles */
    @media print {
      .navbar {
        display: none !important;
      }
    }

    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getInitials(): string {
    if (!this.currentUser) return '?';
    const names = this.currentUser.full_name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.closeMobileMenu();
      this.router.navigate(['/login']);
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}