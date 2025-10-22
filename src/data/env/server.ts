// Import der notwendigen Bibliotheken für Umgebungsvariablen-Validierung
import { createEnv } from "@t3-oss/env-nextjs"  // T3 Stack Tool für sichere Env-Variable-Validierung
import { z } from "zod"  // Schema-Validierungsbibliothek

// Export der validierten Umgebungsvariablen für Server-seitige Verwendung
export const env = createEnv({
  // Definition der Server-seitigen Umgebungsvariablen mit Validierung
  server: {
    // Datenbank-Verbindungsparameter
    DB_PASSWORD: z.string().min(1),  // Datenbank-Passwort (mindestens 1 Zeichen)
    DB_USER: z.string().min(1),      // Datenbank-Benutzername (mindestens 1 Zeichen)
    DB_HOST: z.string().min(1),      // Datenbank-Host (z.B. localhost oder IP)
    DB_PORT: z.string().min(1),      // Datenbank-Port (z.B. "5432" für PostgreSQL)
    DB_NAME: z.string().min(1),      // Name der Datenbank
    
    // Clerk Authentication Service
    CLERK_SECRET_KEY: z.string().min(1),        // Geheimer Schlüssel für Clerk Auth
    CLERK_WEBHOOK_SECRET: z.string().min(1),    // Webhook-Secret für Clerk Events
    
    // File Upload Service
    UPLOADTHING_TOKEN: z.string().min(1).optional(),       // API-Token für UploadThing Service
    
    // AI/ML API Keys
    ANTHROPIC_API_KEY: z.string().min(1).optional(),       // API-Key für Anthropic (Claude AI)
    GEMINI_API_KEY: z.string().min(1).optional(),          // API-Key für Google Gemini AI
    
    // Email Service
    RESEND_API_KEY: z.string().min(1).optional(),          // API-Key für Resend Email Service
    
    // Server Configuration
    SERVER_URL: z.string().min(1).optional(),              // Basis-URL des Servers
  },
  
  // Funktion zur Erstellung des finalen Schemas mit Transformation
  createFinalSchema: env => {
    return z.object(env).transform(val => {
      // Destructuring: Extrahiere DB-Parameter und behalte den Rest
      const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, ...rest } = val

      // Rückgabe des transformierten Objekts
      return {
        ...rest,  // Alle anderen Umgebungsvariablen bleiben unverändert
        // Erstelle eine PostgreSQL Connection String aus den einzelnen DB-Parametern
        DATABASE_URL: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
      }
    })
  },
  
  // Konfiguration: Leere Strings werden als undefined behandelt
  emptyStringAsUndefined: true,
  
  // Runtime-Umgebung für die Validierung (Node.js process.env)
  experimental__runtimeEnv: process.env,
})