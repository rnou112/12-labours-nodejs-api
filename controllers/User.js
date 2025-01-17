
const db = require("../config/db");

db.connect();

class User {
  async getAll(){
    const query=
      `select * from users`;
    let results = await db.query(query).catch(console.log);
    return results.rows;
  }

  async getTypes(){
    const query=
      `select type_id as value, type_name as display from user_types`;
    let results = await db.query(query).catch(console.log);
    return results.rows;
  }

  async authenticateLocal(email, pass){
    const query=
      `select u.user_id from users u inner join local_users lu ON u.user_id=lu.user_id
      where lower(u.email)=lower('${email}') and lu.password='${pass}' and lu.is_Active=true`;
    let results = await db.query(query).catch(console.log);
    return results.rows;
  }

  async authenticateGoogle(email,googleId){
    const query=
      `select u.user_id as user_id from users u inner join google_users gu ON u.user_id=gu.user_id
      where lower(u.email)=lower('${email}') and gu.google_id='${googleId}'`;
    let results = await db.query(query).catch(console.log);
    return results.rows;
  }

  async getProfileById(userId){
    const query=
      `select user_id,type_name, email,title,first_name, last_name,profession,u.institution_id as institution_id, institution_name, nhi, hpi,u.dhb_id as dhb_id,dhb_name,u.hospital_id as hospital_id,hospital_name
      from users u inner join user_types ut ON u.type_id= ut.type_id
      left join institutions i ON u.institution_id=i.institution_id
      left join dhbs d ON u.dhb_id=d.dhb_id
      left join hospitals h ON u.hospital_id=h.hospital_id
      where user_id='${userId}'`;
    let results = await db.query(query).catch(console.log);
    return results.rows;
  }

  async createUser(userInfo,strategy){
    const query=
      `insert into users (type_id, email, title, first_name, last_name,profession,institution_id,hpi,hospital_id,nhi,dhb_id,created)
      select ut.type_id,'${userInfo.email}','${userInfo.title}','${userInfo.firstName}','${userInfo.lastName}','${userInfo.profession}',${userInfo.institutionId},'${userInfo.hpi}',${userInfo.hospitalId},'${userInfo.nhi}',${userInfo.dhbId},Now()
      from user_types ut where LOWER(ut.type_name)='${userInfo.userTypeName.toLowerCase()}'`;
    let results = await db.query(query).catch(console.log);
    if(results.rowCount==1){
      let newUser=await db.query(`select user_id from users where lower(email)=lower('${userInfo.email}')`).catch(console.log)
      const newUserId=newUser.rows[0].user_id
      const query2= (strategy==='local')?
        `insert into local_users (user_id, password, is_Active,created)
          values (${newUserId},'${userInfo.password}',false,Now())` 
        : 
        `insert into google_users (user_id, google_id,created)
        values (${newUserId},'${userInfo.googleId}',Now())`
      let results2 = await db.query(query2).catch(console.log);
      return (results2.rowCount==1 ? newUserId : 0 ); 
    }

    return 0;
  }

  async localUserExists(email){
    const query=`select lu.user_id as user_id,is_active
    from users u inner JOIN local_users lu on u.user_id=lu.user_id
    where LOWER(email)='${email.toLowerCase()}'`
    
    let results = await db.query(query).catch(console.log);
    return results.rowCount>0 ? results.rows[0] : null;  //results.rowCount>0;
  }

  async activateLocal(userId){
    const query=
      `update local_users set is_Active=true where user_id=${userId}`
    let results = await db.query(query).catch(console.log);
    return results.rowCount==1;
  }

  async changePassword(userId,oldPassword,newPassword){
    const query=
    `update local_users set password='${newPassword}' where user_id=${userId} and password='${oldPassword}'`
    let results = await db.query(query).catch(console.log);
    return results.rowCount==1;
  }

  async deleteUser(userId){
    const query=
    `delete from users where user_id= ${userId}`
    let results = await db.query(query).catch(console.log);
    return results.rowCount==1;
  }
}

db.end;

module.exports=User;