import mariadb from 'mariadb' ;

const connect = mariadb.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'dinobel2',
    database: 'fisiobd'
});


export default connect;


/* TESTE DE CONEXÃO NO BANCO DE DADOS
async function testConnection() {
  let conn;
  try {
    conn = await connect.getConnection();
    console.log("Conectado ao banco de dados com sucesso!");

    const rows = await conn.query("SELECT 1 as val");
    console.log("Consulta executada com sucesso. Resultado:", rows[0]);

  } catch (err) {
    console.error("Falha ao conectar ou executar a consulta:", err);
  } finally {
    if (conn) {
      conn.release();
      console.log("Conexão liberada.");
    }
  }
  connect.end();
}

testConnection();*/

/* EXEMPLO DE CONSUMO DA CONNECT
import connect from './connect.js';

async function localizaFisioCPF(cpf){//Função que busca o fisioterapeuta com base no cpf
    let conn;

    try{
        conn = await.connect.getConnection(); //Define "conn" como uma conexão estabelecida com o banco de dados

        const SQL = "SELECT * FROM fisioterapeutas WHERE cpf = ?";//String de sintaxe do SQL
        const rows = await conn.query(sql, [cpf]);

        return rows[0];


    } catch (err)
        console.error("deu erro essa parada aí: ", err);
        throw err;
    }finally {
        if(conn){
            conn.realese();//isso faz a conexão ser liberada e termina o trafico dela
        }
    }
}
*/