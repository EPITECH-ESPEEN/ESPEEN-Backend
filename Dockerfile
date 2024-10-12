FROM node:22.9.0

WORKDIR /app/

COPY ./ /app/

RUN npm i

CMD [ "npm", "run", "start" ]