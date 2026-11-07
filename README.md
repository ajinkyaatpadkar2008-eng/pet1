# Ledger — Personal Expense Tracker

A responsive, browser-based personal expense tracker built with HTML, CSS and JavaScript.

## Files
- `index.html` — page structure
- `styles.css` — responsive design
- `app.js` — transactions, charts, filters, CSV export and browser storage

## Run on your computer
1. Extract the ZIP file.
2. Open the `personal-expense-tracker` folder.
3. Double-click `index.html` to open it in Chrome.
4. For a smoother development workflow, open the folder in VS Code and use the Live Server extension.

## Publish globally with GitHub Pages (using Chrome)
1. Sign in to GitHub and create a **new public repository** named `personal-expense-tracker`.
2. Choose **Add file → Upload files**.
3. Upload `index.html`, `styles.css`, `app.js` and this README (upload the files themselves, not an extra enclosing folder).
4. Commit the upload to the `main` branch.
5. Open the repository's **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select branch `main` and folder `/ (root)`, then press **Save**.
8. Wait a minute or two. The Pages section will show your public website URL, usually:
   `https://YOUR-USERNAME.github.io/personal-expense-tracker/`

## Data and privacy
- Transactions are saved in localStorage in the browser where you enter them.
- GitHub Pages hosts the website files, not your transaction records.
- Your records do not automatically sync between devices or browsers.
- Clearing browser site data can erase your saved transactions. Use **Export CSV** periodically to keep a backup.
- Do not enter bank passwords, card numbers, account numbers or other highly sensitive information.

## Notes
- Currency is set to Indian Rupees (INR).
- The charts use Chart.js from a CDN, so charts need an internet connection.
- The site can run without a server; it does not require Python, Flask, Node.js or a database.
