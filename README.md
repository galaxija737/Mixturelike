# Mixturelike

**Mixturelike** is a lightweight desktop application inspired by Mixture.app, designed for frontend developers to manage and preview their web projects easily. Built using Electron, it supports SCSS compilation and lays the groundwork for integrating Liquid templating and live preview features.

---

## Current Features

- Basic Electron desktop app setup
- SCSS compilation to CSS using Dart Sass
- SCSS file watcher for automatic recompilation on changes
- Simple starter UI

---

## How to Run

1. Clone the repository or download and extract the project files.

2. Navigate to the project directory:

   ```bash
   cd Mixturelike
   ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Start the SCSS watcher to compile SCSS on file changes:
    ```bash
   npm run watch:scss
    ```

5. In a new terminal window, start the Electron app:
    ```bash
   npm start
    ```

## Roadmap

The goal is to evolve Mixturelike into a powerful front-end project manager and live preview tool similar to Mixture.app. Planned features include:

- Project Folder Management: Open and manage project folders seamlessly within the app
- File Watching: Automatically detect changes in HTML, SCSS, JS, and template files
- Live Preview: Real-time browser preview that reloads as source files change
- Liquid Templating Integration: Render HTML templates with Liquid syntax for dynamic content
- Multi-language Preprocessing: Support for SCSS, Less, TypeScript, and more
- Static Site Export: Export fully compiled static websites ready for deployment
- Plugin System: Extend app functionality with third-party plugins and integrations
- Cross-platform Packaging: Build native installers for Windows, macOS, and Linux

## Contributions & Feedback

Contributions, ideas, and feedback are welcome! Feel free to open issues or pull requests to help improve Mixturelike.
