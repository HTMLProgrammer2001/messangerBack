FROM node:10 as build

WORKDIR /home
COPY ./ .
RUN npm install
ENV GENERATE_SOURCEMAP false
RUN npm run build


FROM node:10

WORKDIR /home
EXPOSE 5000

COPY --from=build /home/build .
COPY --from=build /home/package.json .
RUN npm install --only=production
CMD ["node", "app.js"]
