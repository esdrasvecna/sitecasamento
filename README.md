# Site do casamento (MVP) — Lista de Presentes

Este projeto é um MVP em **HTML/CSS/JS** com uma página de **lista de presentes** em cards, lendo do **Firestore**.

## Como configurar
1. Crie um projeto no Firebase
2. Vá em **Project settings > Your apps > Web app** e copie a config
3. Cole a config em `js/firebase.js`

## Estrutura no Firestore
Coleção: `gifts`

Campos sugeridos:
- `title` (string)
- `description` (string)
- `price` (number)
- `imageUrl` (string)
- `category` (string)
- `link` (string) — link do presente
- `pix` (string) — chave pix (opcional)
- `active` (boolean)
- `createdAt` (timestamp)

## Regras (MVP)
Sugestão:
- `gifts`: leitura liberada, escrita bloqueada

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gifts/{doc} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Deploy
- Suba no GitHub
- Conecte no Netlify (publish dir: `/`)
