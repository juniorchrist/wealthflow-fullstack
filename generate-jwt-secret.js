import crypto from 'crypto';

// Générer un secret JWT sécurisé de 64 octets en base64
const jwtSecret = crypto.randomBytes(64).toString('base64');

console.log('JWT_SECRET généré:');
console.log(jwtSecret);
console.log('');
console.log('Copiez cette valeur et collez-la comme JWT_SECRET dans Render Dashboard');
