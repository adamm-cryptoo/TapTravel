# TapTravel website

Static site: plain HTML, CSS, and JavaScript. No build step.

## Files
- `index.html` landing page with the tap-to-teleport map
- `destinations.html` all destinations
- `destination.html` one template, filled from `js/data.js` (`destination.html?id=barcelona`)
- `plans.html` Free, Explorer, Premium, Family, and Black Friday offers
- `policies.html` company policies, legal ages, Local Look rules, refunds
- `css/style.css` all styling and colors (see `:root`)
- `js/data.js` **edit this to add or change destinations**
- `js/main.js` shared header and footer, map, plans, Black Friday dates (`BF` at the top)
- `assets/logo.jpeg` app logo

## Run locally
Open `index.html`, or use the VS Code "Live Server" extension.

## Publish on GitHub
1. Create a public repository and push this folder.
2. Repository Settings > Pages > Deploy from branch > `main` / root.

## Add a destination
Copy one object in `js/data.js`, change its fields, and set `lat`/`lon`. It appears on the map and in the grid automatically.

## Note
Policy text and prices are placeholders. Have a lawyer review the policies before launch.
