# seed activate
$env:NODE_ENV="development" npx sequelize-cli db:seed:all

# Empty
$env:NODE_ENV="development" npx sequelize-cli db:seed:undo:all