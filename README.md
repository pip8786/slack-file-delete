### Prerequisites:
* Yarn should be installed on your machine (or npm)

### How to use:
1. Clone this repository
1. `yarn install`
1. Create an app and add it to your slack: https://api.slack.com/apps?new_app=1
1. Create a `.env` file in the root directory and grab the OAuth token from `OAuth and Permissions`.
   1. Put the token in the `.env` file like so: `USER_TOKEN=<TOKEN_HERE>`
1. `yarn dev`