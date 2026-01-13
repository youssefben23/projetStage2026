# ============================================
# FICHIER: backend/run.py
# Point d'Entrée de l'Application
# ============================================
"""
Script de lancement de l'application Flask
"""

import os
from app import create_app, db

# Récupérer l'environnement
env = os.environ.get('FLASK_ENV', 'development')

# Créer l'application
app = create_app(env)


@app.cli.command()
def init_db():
    """Initialiser la base de données"""
    db.create_all()
    print('✅ Base de données initialisée!')


@app.cli.command()
def drop_db():
    """Supprimer toutes les tables"""
    if input('⚠️  Êtes-vous sûr ? (yes/no): ') == 'yes':
        db.drop_all()
        print('✅ Base de données supprimée!')


@app.cli.command()
def seed_db():
    """Peupler la base avec des données de test"""
    from app.models.user import User
    from app.services.template_service import TemplateService

    # Créer un utilisateur de test
    try:
        user = User(
            email='test@test.com',
            password='test123',
            nom='Test',
            prenom='User'
        )
        db.session.add(user)
        db.session.commit()

        print('✅ Utilisateur de test créé: test@test.com / test123')

        # Créer un template de test
        template = TemplateService.create_template(
            user_id=user.id,
            nom='Template de Test',
            sujet='Test Email',
            html_content='<h1>Hello World</h1>',
            css_content='h1 { color: blue; }',
            category='Test',
            tags=['test']
        )

        print(f'✅ Template de test créé: {template.nom}')

    except Exception as e:
        print(f'❌ Erreur: {e}')


if __name__ == '__main__':
    # Lancer le serveur
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=(env == 'development')
    )
