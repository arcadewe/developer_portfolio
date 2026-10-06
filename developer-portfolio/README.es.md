# Portafolio de Desarrollador — Mundo 1-1

[English](README.md)

Un portafolio personal de desarrollador construido como un nivel jugable al estilo de Super Mario. Los visitantes corren, saltan y golpean bloques para llegar a las distintas secciones del sitio, o usan la navegación normal si solo quieren leer.

Hecho con **Angular 21** y publicado en **Firebase Hosting**.

## Funcionalidades

- **Página de inicio jugable**: un nivel de 8 bits con física, colisiones, un personaje que corre y salta, y una cámara que sigue al jugador en pantallas pequeñas.
- **Elementos interactivos**
  - **Títulos en las nubes**: Sobre mí, Experiencia, Github y Cursos están sobre nubes en las que también puedes pararte.
  - **Bloques de pregunta**: golpear uno desde abajo abre el perfil de LinkedIn.
  - **Tubo**: pararse encima y presionar abajo abre el perfil de GitHub.
  - **Bandera**: tocar el mástil, la punta o la bandera descarga el CV (PDF).
- **Páginas de contenido**: Sobre mí (habilidades), Experiencia (línea de tiempo) y Cursos.
- **Inglés y español**, se cambia desde la esquina superior derecha. La elección se recuerda.
- **Sonido**: música de fondo y efectos, con un control de volumen que se recuerda entre visitas.
- **Adaptable**: en pantallas de 800px de ancho o menos, el nivel mantiene un diseño fijo y hace zoom sobre el jugador, los títulos pasan a un menú hamburguesa y aparecen controles táctiles en pantalla.

## Controles

| Acción | Teclado | Táctil |
|---|---|---|
| Moverse | `←` `→` o `A` `D` | ◀ ▶ |
| Saltar | `↑` o `W` | ▲ |
| Entrar al tubo | `↓` o `S` (encima del tubo) | ▼ |

## Cómo empezar

Requisitos: [Node.js](https://nodejs.org/) 24 LTS (incluye npm).

```bash
npm install
npm start
```

Abre `http://localhost:4200/`. La página se recarga sola cuando cambias un archivo.

| Comando | Qué hace |
|---|---|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el sitio de producción en `dist/developer-portfolio/browser` |
| `npm test` | Ejecuta las pruebas unitarias (Vitest) |
| `npm run watch` | Recompila con cada cambio (configuración de desarrollo) |

## Estructura del proyecto

```
content/                  Datos y textos del sitio (edítalos para cambiar lo que dice el sitio)
  en.json, es.json        Textos, experiencia y cursos por idioma
  profile.json            Enlaces sociales y ruta del CV
  site.json               Entradas de navegación (nubes y menú móvil)
  skills.json             Grupos de habilidades de la página Sobre mí
public/assets/            Archivos estáticos: sprites, audio y documentos (CV)
src/styles/               CSS global: fuentes, tokens de diseño, base
src/app/
  domain/                 Modelos, idiomas y el PortfolioRepository abstracto
  data-access/            StaticPortfolioRepository y el cargador de traducciones sobre content/
  core/                   Servicios globales: PortfolioFacade, LanguageService, proveedores de i18n, almacenamiento
  layout/                 Encabezado, selector de idioma, menú móvil y la estructura de página
  shared/ui/              Componentes visuales reutilizables (tarjeta pixel, lista de etiquetas, tarjeta de proyecto)
  features/
    home/                 La página Mundo 1-1
      game/               Constantes, modelos, datos del nivel, colisiones y sprites
      touch-controls/     Controles táctiles en pantalla
      volume-control/     Control de volumen
    about-me/, experience/, courses/
```

### Cómo fluyen los datos

Las páginas nunca leen JSON directamente. Usan `PortfolioFacade` (`core/`), que le pide los datos a `PortfolioRepository` (`domain/`). La implementación actual, `StaticPortfolioRepository` (`data-access/`), lee los archivos de `content/`. Para cargar el contenido desde otro lugar, como una API, crea un nuevo repositorio y regístralo en `app.config.ts`.

Las traducciones usan `@ngx-translate/core` con un cargador propio que sirve `content/en.json` y `content/es.json` desde el bundle, así que no hace falta ninguna petición extra a la red.

## Cómo editar el contenido

| Para cambiar | Edita |
|---|---|
| Cualquier texto del sitio | `content/en.json` y `content/es.json` (mantén ambos iguales) |
| Experiencia | `experience.items` en ambos archivos de idioma |
| Cursos | `courses.items` en ambos archivos de idioma |
| Habilidades de Sobre mí | `content/skills.json` |
| Enlaces de GitHub / LinkedIn | `content/profile.json` |
| El CV que descarga la bandera | Reemplaza `public/assets/documents/daniel-caballero-resume.pdf`, o cambia `cv.path` en `content/profile.json` |
| Entradas de navegación | `content/site.json` |
| Diseño del nivel, física, sprites y sonidos | `src/app/features/home/game/` |
| Colores, fuentes y estilos compartidos | `src/styles/tokens.css` |

## Despliegue

Cada push a `main` compila el sitio y lo publica en Firebase Hosting mediante GitHub Actions (`.github/workflows/firebase-hosting-merge.yml`).

El workflow necesita el secreto del repositorio `FIREBASE_SERVICE_ACCOUNT_DEVELOPER_PORTFOLIO_863DD`, que contiene una clave de cuenta de servicio de Firebase para el proyecto `developer-portfolio-863dd`.

Para publicar manualmente:

```bash
npm run build
npx firebase-tools deploy --only hosting
```

## Créditos

- Música: "Overworld Theme" de Louswan y "Short Chiptune Loop" de 2D_PlatformerGuy (CC0), de [OpenGameArt](https://opengameart.org/).
- Efectos de sonido: "8-Bit Sound Effect Pack Vol. 001" de Shades (CC0), de [OpenGameArt](https://opengameart.org/content/8-bit-sound-effect-pack-vol-001).
- Fuentes: Press Start 2P y Space Grotesk, de Google Fonts.
- Este es un homenaje personal y sin fines comerciales. Super Mario es una marca registrada de Nintendo, que no está afiliada a este proyecto.
