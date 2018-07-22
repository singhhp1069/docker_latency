FROM node:8

# Create app directory
RUN mkdir -p /myapp/src
WORKDIR /myapp

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied

COPY package.json /myapp/

RUN npm install
# If you are building your code for production
# RUN npm install --only=production



# Bundle app source
ADD src /myapp/src


EXPOSE 8080
CMD [ "npm", "start" ]