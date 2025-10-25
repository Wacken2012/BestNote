# Local JWT (development only)

🇩🇪 Deutsch | 🇬🇧 English below

---

## 🇩🇪 Deutsch

Dieses Dokument erklärt, wie man für die lokale Entwicklung ein Test-JWT erstellt und nutzt.

Warnung: Nicht in Produktion verwenden. Nutze in Produktion einen echten Auth-Provider und rotiere Secrets.

### Wie es funktioniert

Der Server enthält eine JWT-Überprüfungs-Middleware. Sie erwartet einen `Authorization: Bearer <token>` Header und setzt bei Gültigkeit `req.viewer = { id, roles }`.

### Test-Token erzeugen

Ein Hilfsskript `scripts/generate_jwt.js` erstellt Test-Token. Das Skript importiert einen Helper aus dem Server-Build, daher sollte der Server gebaut werden:

```bash
cd server
npm run build
cd ..
node scripts/generate_jwt.js <userId> <role1> [role2 ...]
```

Beispiel:

```bash
node scripts/generate_jwt.js L1 admin
```

Das Skript gibt ein Token aus, das du in Requests verwenden kannst.

### Token verwenden

Server starten (ts-node-dev oder gebautes Node) und Header setzen:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/members/L1
```

Wenn das Token `roles: ["admin"]` enthält, gilt die Anfrage als Admin. Mit `roles: ["mitglied"]` und `id: "L1"` wird die Mitgliederansicht gefiltert.

### Environment

- `JWT_SECRET`: Setze in Produktion ein starkes Secret. Standard: `dev-secret`.
- `LOG_LEVEL`: `info` oder `debug`.

### Nächste Schritte (Empfehlung)

- Ein admin-geschützter Endpoint zur Token-Ausgabe für Dev/Admin UIs.
- Integration mit OAuth2/OpenID für Produktion.

---

## 🇬🇧 English

This document explains how to create and use a test JWT for local development.

Warning: do not use the steps below in production. Use a proper auth provider and rotate secrets.

### How it works

The server includes a JWT verification middleware. It expects an `Authorization: Bearer <token>` header and, when valid, sets `req.viewer = { id, roles }` for downstream route handlers.

### Generating a test token

A helper script `scripts/generate_jwt.js` exists to create test tokens. The script imports a helper from the server build output; therefore you should build the server first:

```bash
cd server
npm run build
cd ..
node scripts/generate_jwt.js <userId> <role1> [role2 ...]
```

Example:

```bash
node scripts/generate_jwt.js L1 admin
```

The script prints a JWT you can use in requests.

### Using the token

Start the dev server (ts-node-dev or the built server) and include the token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/members/L1
```

If the token contains `roles: ["admin"]` the request will be treated as an admin. If the token contains `roles: ["mitglied"]` and `id: "L1"`, the member view will be filtered accordingly.

### Environment

- `JWT_SECRET`: set to a strong secret in production. The server defaults to `dev-secret` when not set.
- `LOG_LEVEL`: set to `info` or `debug` to control logging verbosity while developing.

### Next steps (recommended)

- Add an admin-only token issuance endpoint (for dev/admin UIs) guarded by a secure access method.
- Integrate with an OAuth2/OpenID provider for production authentication.

That's it — use this only for local development and tests.
