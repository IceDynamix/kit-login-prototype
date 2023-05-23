# kit login prototype

basic login implementation example for the karlsruhe institute of technology based on nodejs and passport

## run locally

- ensure node and npm are installed
- `cp config.example.json config.json`
- change relevant config parameters in the `config.json`
- `npm install`
- `node main.js`

## how to use

this is just a proof of concept without any ui. follow the routes shown on the index to login/logout

- `/` shows data about the currently logged-in user
- `/auth` starts the authentication process and redirects to the KIT page 
- `/logout` logs out the user