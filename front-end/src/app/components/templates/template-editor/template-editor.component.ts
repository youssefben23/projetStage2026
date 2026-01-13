import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../../services/template.service';
import { EmailTemplate } from '../../../models/template.model';

@Component({
  selector: 'app-template-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="editor-container">
      <div class="editor-header">
        <h2>{{ isEditMode ? 'Modifier le Template' : 'Nouveau Template' }}</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="validateTemplate()" [disabled]="loading">
            Valider
          </button>
          <button class="btn btn-primary" (click)="saveTemplate()" [disabled]="loading || !canSave()">
            {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
      </div>

      <div class="error-message" *ngIf="error">{{ error }}</div>
      <div class="success-message" *ngIf="success">{{ success }}</div>

      <form (ngSubmit)="saveTemplate()" #templateForm="ngForm">
        <div class="form-group">
          <label>Nom du Template *</label>
          <input
            type="text"
            [(ngModel)]="nom"
            name="nom"
            required
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label>Sujet de l'E-mail *</label>
          <input
            type="text"
            [(ngModel)]="sujet"
            name="sujet"
            required
            class="form-control"
          />
        </div>

        <div class="editor-layout">
          <!-- ✅ ÉDITEUR UNIFIÉ HTML/CSS -->
          <div class="unified-editor-panel">
            <div class="panel-header">
              <h3>📝 Éditeur HTML/CSS</h3>
              <div class="editor-info">
                <span class="char-count">{{ unifiedContent.length }} caractères</span>
                <span class="separator">|</span>
                <span class="html-count">HTML: {{ extractedHtml.length }}</span>
                <span class="separator">|</span>
                <span class="css-count">CSS: {{ extractedCss.length }}</span>
              </div>
            </div>
            <textarea
              #unifiedEditor
              [(ngModel)]="unifiedContent"
              name="unifiedContent"
              (input)="onUnifiedContentChange()"
              class="code-editor unified"
              placeholder="Écrivez votre HTML avec le CSS dans les balises <style>...

Exemple :
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      padding: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 10px;
    }
    h1 {
      color: white;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class='container'>
    <h1>Bonjour !</h1>
    <p>Bienvenue dans votre email</p>
  </div>
</body>
</html>"
            ></textarea>
          </div>

          <!-- ✅ APERÇU EN TEMPS RÉEL -->
          <div class="preview-panel">
            <div class="panel-header">
              <h3>📱 Aperçu en Temps Réel</h3>
              <button 
                type="button" 
                class="btn-refresh" 
                (click)="forceRefreshPreview()"
                title="Actualiser l'aperçu">
                🔄
              </button>
            </div>
            <iframe 
              #previewFrame
              class="preview-iframe"
              [srcdoc]="previewHtml"
              frameborder="0"
              sandbox="allow-same-origin">
            </iframe>
          </div>
        </div>

        <div class="validation-results" *ngIf="validationResult">
          <h4>Résultat de Validation</h4>
          <div class="validation-status" [class.valid]="validationResult.is_valid" [class.invalid]="!validationResult.is_valid">
            {{ validationResult.is_valid ? '✅ Template valide' : '❌ Template invalide' }}
          </div>
          <div class="validation-errors" *ngIf="validationResult.errors && validationResult.errors.length > 0">
            <h5>Erreurs:</h5>
            <ul>
              <li *ngFor="let error of validationResult.errors">{{ error.message }}</li>
            </ul>
          </div>
          <div class="validation-warnings" *ngIf="validationResult.warnings && validationResult.warnings.length > 0">
            <h5>Avertissements:</h5>
            <ul>
              <li *ngFor="let warning of validationResult.warnings">{{ warning.message }}</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .editor-container {
      padding: 24px;
      max-width: 1800px;
      margin: 0 auto;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .editor-header h2 {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
      transform: scale(1.05);
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 5px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    /* ✅ LAYOUT ÉDITEUR UNIFIÉ */
    .editor-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 24px;
      height: calc(100vh - 400px);
      min-height: 600px;
    }

    /* ✅ PANEL ÉDITEUR UNIFIÉ */
    .unified-editor-panel {
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 2px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .unified-editor-panel:hover {
      border-color: #667eea;
      box-shadow: 0 6px 12px rgba(102, 126, 234, 0.2);
    }

    .preview-panel {
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 2px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .preview-panel:hover {
      border-color: #667eea;
      box-shadow: 0 6px 12px rgba(102, 126, 234, 0.2);
    }

    .panel-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 14px 20px;
      color: white;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 15px;
      color: white;
    }

    .editor-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      opacity: 0.9;
    }

    .separator {
      opacity: 0.5;
    }

    .char-count,
    .html-count,
    .css-count {
      font-family: 'Courier New', monospace;
    }

    .btn-refresh {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
    }

    .btn-refresh:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(180deg);
    }

    /* ✅ ÉDITEUR DE CODE UNIFIÉ */
    .code-editor.unified {
      flex: 1;
      padding: 20px;
      border: none;
      font-family: 'Fira Code', 'Courier New', 'Consolas', 'Monaco', monospace;
      font-size: 14px;
      line-height: 1.8;
      resize: none;
      outline: none;
      background: #1e1e1e;
      color: #d4d4d4;
      transition: all 0.3s ease;
      tab-size: 2;
    }

    .code-editor.unified:focus {
      background: #252526;
    }

    .code-editor.unified::placeholder {
      color: #6a6a6a;
      line-height: 1.8;
    }

    .preview-iframe {
      flex: 1;
      width: 100%;
      background: white;
      border: none;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 12px 20px;
      border-radius: 5px;
      margin-bottom: 20px;
      border-left: 4px solid #dc3545;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 12px 20px;
      border-radius: 5px;
      margin-bottom: 20px;
      border-left: 4px solid #28a745;
    }

    .validation-results {
      margin-top: 24px;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #17a2b8;
    }

    .validation-results h4 {
      margin-bottom: 16px;
      color: #333;
      font-size: 18px;
    }

    .validation-status {
      font-weight: 700;
      margin-bottom: 16px;
      padding: 12px;
      border-radius: 5px;
      font-size: 16px;
    }

    .validation-status.valid {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
      border-left: 4px solid #28a745;
    }

    .validation-status.invalid {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
      border-left: 4px solid #dc3545;
    }

    .validation-errors,
    .validation-warnings {
      margin-top: 16px;
      padding: 12px;
      border-radius: 5px;
    }

    .validation-errors {
      background: rgba(220, 53, 69, 0.05);
      border-left: 3px solid #dc3545;
    }

    .validation-warnings {
      background: rgba(255, 193, 7, 0.05);
      border-left: 3px solid #ffc107;
    }

    .validation-errors h5 {
      color: #dc3545;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
    }

    .validation-warnings h5 {
      color: #ffc107;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
    }

    .validation-errors ul,
    .validation-warnings ul {
      margin: 0;
      padding-left: 20px;
    }

    .validation-errors li,
    .validation-warnings li {
      margin-bottom: 6px;
      font-size: 13px;
      color: #666;
    }

    @media (max-width: 1200px) {
      .editor-layout {
        grid-template-columns: 1fr;
        height: auto;
      }

      .unified-editor-panel,
      .preview-panel {
        min-height: 500px;
      }
    }

    @media (max-width: 768px) {
      .editor-layout {
        gap: 16px;
      }

      .unified-editor-panel,
      .preview-panel {
        min-height: 400px;
      }
    }
  `]
})
export class TemplateEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  @ViewChild('unifiedEditor') unifiedEditor!: ElementRef<HTMLTextAreaElement>;

  isEditMode = false;
  templateId: number | null = null;
  nom = '';
  sujet = '';
  
  // ✅ CONTENU UNIFIÉ HTML/CSS
  unifiedContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 10px;
      font-family: Arial, sans-serif;
    }
    
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 20px;
    }
    
    p {
      color: white;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bonjour !</h1>
    <p>Votre contenu HTML ici...</p>
  </div>
</body>
</html>`;

  // ✅ CONTENU EXTRAIT (pour la sauvegarde)
  extractedHtml = '';
  extractedCss = '';
  
  previewHtml = '';
  loading = false;
  error = '';
  success = '';
  validationResult: any = null;

  private updateDebounceTimer: any;

  constructor(
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.templateId = +params['id'];
        this.loadTemplate();
      } else {
        this.extractHtmlAndCss();
        this.updatePreview();
      }
    });
  }

  ngAfterViewInit(): void {
    this.updatePreview();
  }

  /**
   * ✅ CHARGEMENT DU TEMPLATE
   */
  loadTemplate(): void {
    if (!this.templateId) return;

    this.loading = true;
    this.templateService.getTemplate(this.templateId).subscribe({
      next: (response) => {
        if (response.success && response.template) {
          const template = response.template;
          this.nom = template.nom;
          this.sujet = template.sujet;
          
          // ✅ RECONSTRUCTION DU CONTENU UNIFIÉ
          this.unifiedContent = this.reconstructUnifiedContent(
            template.html_content,
            template.css_content || ''
          );
          
          this.extractHtmlAndCss();
          this.updatePreview();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du template';
        this.loading = false;
      }
    });
  }

  /**
   * ✅ RECONSTRUCTION DU CONTENU UNIFIÉ depuis HTML + CSS séparés
   */
  reconstructUnifiedContent(html: string, css: string): string {
    // Si le HTML contient déjà une balise <style>, on le retourne tel quel
    if (html.includes('<style>') || html.includes('<style ')) {
      return html;
    }

    // Sinon, on insère le CSS dans une balise <style>
    const hasHtmlTag = html.includes('<html');
    const hasHeadTag = html.includes('<head');

    if (!hasHtmlTag) {
      // HTML simple sans structure complète
      return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;
    } else if (hasHeadTag) {
      // HTML avec head, on insère le CSS dans le head
      return html.replace('</head>', `  <style>
${css}
  </style>
</head>`);
    } else {
      // HTML avec balise html mais sans head
      return html.replace('<html', `<html lang="fr">
<head>
  <style>
${css}
  </style>
</head>`);
    }
  }

  /**
   * ✅ EXTRACTION HTML ET CSS depuis le contenu unifié
   */
  extractHtmlAndCss(): void {
    const content = this.unifiedContent;
    
    // Extraction du CSS depuis les balises <style>
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let cssContent = '';
    let match;
    
    while ((match = styleRegex.exec(content)) !== null) {
      cssContent += match[1].trim() + '\n';
    }
    
    // Extraction du HTML (tout le contenu, on garde les balises <style> pour la prévisualisation)
    this.extractedHtml = content;
    this.extractedCss = cssContent.trim();
  }

  /**
   * ✅ ÉVÉNEMENT : Changement dans l'éditeur unifié
   */
  onUnifiedContentChange(): void {
    // Debounce pour optimiser les performances
    clearTimeout(this.updateDebounceTimer);
    this.updateDebounceTimer = setTimeout(() => {
      this.extractHtmlAndCss();
      this.updatePreview();
    }, 300);
  }

  /**
   * ✅ MISE À JOUR DE L'APERÇU
   */
  updatePreview(): void {
    this.previewHtml = this.unifiedContent;
  }

  /**
   * ✅ FORCER LE RAFRAÎCHISSEMENT
   */
  forceRefreshPreview(): void {
    this.updatePreview();
    if (this.previewFrame) {
      const iframe = this.previewFrame.nativeElement;
      iframe.srcdoc = this.previewHtml;
    }
  }

  /**
   * ✅ VALIDATION DU TEMPLATE
   */
  validateTemplate(): void {
    if (this.templateId) {
      this.templateService.validateTemplate(this.templateId).subscribe({
        next: (response) => {
          if (response.success && response.validation) {
            this.validationResult = response.validation;
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la validation';
        }
      });
    } else {
      // Validation côté client basique
      const errors: any[] = [];
      const warnings: any[] = [];

      if (!this.unifiedContent || !this.unifiedContent.trim()) {
        errors.push({ type: 'html', message: 'Le contenu est requis' });
      }

      if (this.unifiedContent.includes('<script')) {
        errors.push({ type: 'html', message: 'Les balises <script> sont interdites' });
      }

      // Vérification basique de la structure HTML
      if (!this.unifiedContent.includes('<!DOCTYPE') && !this.unifiedContent.includes('<html')) {
        warnings.push({ type: 'html', message: 'Structure HTML incomplète détectée' });
      }

      this.validationResult = {
        is_valid: errors.length === 0,
        html_valid: errors.length === 0,
        css_valid: true,
        errors: errors,
        warnings: warnings,
        error_count: errors.length,
        warning_count: warnings.length
      };
    }
  }

  /**
   * ✅ VÉRIFICATION AVANT SAUVEGARDE
   */
  canSave(): boolean {
    return !!(this.nom.trim() && this.sujet.trim() && this.unifiedContent.trim());
  }

  /**
   * ✅ SAUVEGARDE DU TEMPLATE
   */
  saveTemplate(): void {
    if (!this.canSave()) {
      this.error = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // ✅ EXTRACTION FINALE avant sauvegarde
    this.extractHtmlAndCss();

    // Préparation des données pour l'API (format séparé)
    const templateData = {
      nom: this.nom,
      sujet: this.sujet,
      html_content: this.extractedHtml,
      css_content: this.extractedCss
    };

    if (this.isEditMode && this.templateId) {
      this.templateService.updateTemplate(this.templateId, templateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Template mis à jour avec succès !';
            setTimeout(() => {
              this.router.navigate(['/templates', this.templateId]);
            }, 1500);
          } else {
            this.error = response.message || 'Erreur lors de la mise à jour';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la mise à jour';
          this.loading = false;
        }
      });
    } else {
      this.templateService.createTemplate(templateData).subscribe({
        next: (response) => {
          if (response.success && response.template) {
            this.success = 'Template créé avec succès !';
            this.error = '';
            setTimeout(() => {
              this.router.navigate(['/templates', response.template.id]);
            }, 1500);
          } else {
            this.error = response.message || 'Erreur lors de la création';
            this.success = '';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error creating template:', err);
          let errorMessage = 'Erreur lors de la création du template.';
          
          if (err.status === 0) {
            errorMessage = 'Impossible de se connecter au backend. Vérifiez que le serveur Flask est démarré sur http://localhost:5000';
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          this.error = errorMessage;
          this.success = '';
          this.loading = false;
        }
      });
    }
  }
}