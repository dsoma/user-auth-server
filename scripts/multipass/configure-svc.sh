### Create the database for the User Authentication service

sudo mysql --user=root <<EOF
CREATE DATABASE users;
CREATE USER 'users'@'localhost' IDENTIFIED BY 'users';
GRANT ALL PRIVILEGES ON users.* TO 'users'@'localhost' WITH GRANT OPTION;
EOF

### Set up the User Authentication service code

sudo mkdir -p /opt/user-auth-server
sudo chmod 777 /opt/user-auth-server
cd /build-user-auth
tar -cf ~/temp.tar .
cd /opt/user-auth-server
sudo tar -xf ~/temp.tar
rm -rf node_modules log data package-lock.json users-sequelize.sqlite3
npm install

# (cd /build-user-auth; tar cf - .) | (cd /opt/user-auth-server; tar xf -)
# {
#     cd /opt/user-auth-server
# }
