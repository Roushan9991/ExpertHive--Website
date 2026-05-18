import mysql from 'mysql2/promise';
mysql.createConnection({host:'localhost', user:'root'}).then(c => { console.log('Connected!'); c.end(); }).catch(e => { console.error('ERROR:', e.message); process.exit(1); });
