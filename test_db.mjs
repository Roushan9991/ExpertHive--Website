import mysql from 'mysql2/promise';

const test = async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root'
    });
    console.log('SUCCESS_NO_PASSWORD_OMITTED');
    await conn.end();
  } catch (e) {
    console.log('FAILED_NO_PASSWORD_OMITTED:', e.message);
  }
};
test();
