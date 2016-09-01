# CPSC 310 Project

This is the base project for CPSC310. Using it will help you get started with many of the tools we will use this term. You do not need to use this if you do not want to, but it may make your life easier.

### Configure Environment

To start using this project you need to get the code and basic toolchain setup: 

1. Install git on your machine (you should be able to execute ```git -v``` on the command line).

1. Install Node on your machine (will also install NPM) (you should be able to execute ```node -v``` and ```npm -v``` the command line).

1. It is important that your project be called ```cpsc310project``` on disk if you want to work with the public test suite we are providing. The easiest way to do this is to:
  
 * Clone the project: ```git clone git@github.com:CS310-2016Fall/cpsc310project_teamXXX.git``` (where ```XXX``` is your team number)
 
 * Move it to the right name: ```mv cpsc310project_teamXXX cpsc310project``` (again replacing ```XXX```)


### Prepare project

Once your project is configured you need to further prepare the project's tooling and dependencies. In the ```cpsc310project``` folder:

1. ```npm run clean```

1. ```npm run configure```

1. ```npm run build```

### Run unit tests

The sample project ships with some automated unit tests. These commands will execute the suites:
 
* Test: ```npm run test``` (or ```npm test```)
* Test coverage: ```npm run cover``` HTML reports: ```./coverage/lcov-report/index.html```

You can also run the tests as a Mocha target inside your favourite IDE (Webstorm and VSCode both work well and are free for academic use).

### Run integration tests

See the [cpsc310d1-pub](https://github.com/CS310-2016Fall/cpsc310d1-pub) repo for instructions.

### Start server

* ```npm run start``` (or ```npm start```)
