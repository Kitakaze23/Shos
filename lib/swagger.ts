import swaggerJsdoc from "swagger-jsdoc"

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fleet Cost Tracker API",
      version: "1.0.0",
      description: "Modern collaborative financial modeling platform for equipment/fleet cost tracking and expense allocation",
      contact: {
        name: "API Support",
        email: "api@yourdomain.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.yourdomain.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "next-auth.session-token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                },
                message: {
                  type: "string",
                  example: "Invalid input",
                },
                details: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: {
                        type: "string",
                        example: "email",
                      },
                      message: {
                        type: "string",
                        example: "Invalid email address",
                      },
                    },
                  },
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Project: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "clx1234567890",
            },
            name: {
              type: "string",
              example: "Fleet Management",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Main fleet cost tracking",
            },
            currency: {
              type: "string",
              example: "RUB",
            },
            costAllocationMethod: {
              type: "string",
              enum: ["by_hours", "equal", "percentage"],
              example: "by_hours",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Equipment: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
              example: "Helicopter N12345",
            },
            category: {
              type: "string",
              example: "Helicopter",
            },
            purchasePrice: {
              type: "string",
              example: "50000000",
            },
            acquisitionDate: {
              type: "string",
              format: "date",
            },
            serviceLifeYears: {
              type: "integer",
              example: 10,
            },
            salvageValue: {
              type: "string",
              nullable: true,
              example: "5000000",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        cookieAuth: [],
      },
    ],
  },
  apis: [
    "./app/api/**/*.ts",
    "./app/api/**/route.ts",
  ],
}

export const swaggerSpec = swaggerJsdoc(options)
