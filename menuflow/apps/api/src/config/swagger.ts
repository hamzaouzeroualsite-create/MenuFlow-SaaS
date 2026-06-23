import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MenuFlow API',
      version: '1.0.0',
      description: 'API REST complète pour la plateforme SaaS MenuFlow - Menus digitaux pour restaurants au Maroc',
      contact: {
        name: 'MenuFlow Support',
        email: 'support@menuflow.ma',
      },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
      { url: 'https://api.menuflow.ma', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentification' },
      { name: 'Restaurants', description: 'Gestion des restaurants' },
      { name: 'Categories', description: 'Catégories de menu' },
      { name: 'Products', description: 'Produits' },
      { name: 'Orders', description: 'Commandes' },
      { name: 'Reservations', description: 'Réservations' },
      { name: 'Customers', description: 'Clients & CRM' },
      { name: 'Analytics', description: 'Statistiques' },
      { name: 'Subscriptions', description: 'Abonnements' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
