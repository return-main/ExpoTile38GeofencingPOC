#Explanation
![Explanation](Tile38.png?raw=true "How it works")

#How to start
Use docker-compose
```bash
docker-compose build && docker-compose up
```
OR
- start the tile38 database (a bash script is provided)
- start the server
```bash
./tile38_docker.sh &
mpm install
npm run start
```
#How to contribute
The code is in TypeScript, so you have to transpile it to JavaScript before running it
To do that, please run
```bash
npm run tsc
```
#Tile38 Commands:
- https://tile38.com/commands/set/
- https://tile38.com/commands/expire/
- https://tile38.com/commands/nearby/
#Sending Push Notifications:
- https://docs.expo.io/versions/latest/guides/push-notifications/

#TODO:
- [ ] Make a diagram to explain what's happening
- [ ] Add data field to notifications with the position of the helpee
- [ ] Find a way to visualise Tile38
- [ ] Dockerize everything
- [ ] Better error codes
- [ ] Don't send empty requests to expo
