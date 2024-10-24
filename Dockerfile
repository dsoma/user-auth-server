FROM node:20

RUN apt-get update -y && apt-get upgrade -y && apt-get -y install curl build-essential git

ENV REQ_LOG_FORMAT="common"
ENV DEBUG="user-auth-server:*"
ENV PORT="3301"
ENV HOST="0.0.0.0"
ENV DB_CONFIG="sequelize-mysql.yaml"

RUN mkdir -p /user-auth && mkdir -p /user-auth/models
COPY package.json *.js /user-auth/
COPY ./models/*.js ./models/*.yaml /user-auth/models/
WORKDIR /user-auth

RUN npm install --unsafe-perm
EXPOSE 3301

CMD [ "node", "./user-server.js" ]
