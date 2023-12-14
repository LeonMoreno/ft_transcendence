FROM node:alpine3.17

# Create app directory
RUN mkdir -p /code
WORKDIR /code

# Install app dependencies
COPY package*.json /code/

RUN npm install

# Bundle app source
COPY . /code

EXPOSE 8080

RUN npm run build

CMD npm run start