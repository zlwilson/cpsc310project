# CPSC 310 Project

This is the base project for CPSC310. You will extend this codebase for all of the deliverables in the project.

## Configure project

To start using this project you need to get your computer configured so you can build and execute the code. This process should be largely similar to the ```cpsc310starter``` repo used during the first lab. To do this, follow these steps; the specifics of each step (especially the first two) will vary based on which operating system your computer has:

1. Install git (you should be able to execute ```git -v``` on the command line).

1. Install Node, which will also install NPM (you should be able to execute ```node -v``` and ```npm -v``` the command line).

1. Clone the project: ```git clone git@github.com:CS310-2016Fall/cpsc310project_teamXXX.git``` (where ```XXX``` is your team number). You can also clone the repo by visiting your project in Github and getting the clone target by clicking on the green button on your project repository.

1. It is important that your project directory be called ```cpsc310project``` if you want to work with the public test suite we are providing. The easiest way to do this is to move it to the right name: ```mv cpsc310project_teamXXX cpsc310project``` (again replacing ```XXX```). ***NOTE:*** This is important or the public test suite will not work. The private test suite we run will do this automatically.


## Project commands

Once your project is configured you need to further prepare the project's tooling and dependencies. In the ```cpsc310project``` folder:

1. ```npm run clean```

1. ```npm run configure```

1. ```npm run build```

If you use Windows; instead try:

1. ```npm run cleanwin```

1. ```npm run configurewin```

1. ```npm run build```

### Run unit tests

The sample project ships with some automated unit tests. These commands will execute the suites:
 
* Test: ```npm run test``` (or ```npm test```)
* Test coverage: ```npm run cover``` (or ```npm run coverwin``` if you use Windows). HTML reports: ```./coverage/lcov-report/index.html```

You can also run the tests as a Mocha target inside your favourite IDE (WebStorm and VSCode both work well and are free for academic use).


### Running the public test suite

Instructions for running the public suite will be included in your team's public suite repo.


### Running the private test suite

To invoke the private suite, add a ```@CPSC310Bot``` mention to any commit in your main branch in Github. Remember: these are rate limited so choose your commits wisely.


### Start the server

* ```npm run start```

You can then open the sample UI in your web browser by visiting [http://localhost:4321](http://localhost:4321). Alternatively, you can invoke the server using curl or some other tool that can hit your REST endpoints once the server is started.

## Developing your project

If you are developing in Typescript you will have to re-compile the Typescript code. This can be done with ```npm run build``` to build the system and get it ready to execute. New unit tests can be written and added to ```/test```; as long as the tests end in ```Spec.ts``` they will be executed automatically when you run ```npm run test```.

### Running and Testing in the IDE

While these instructions are for WebStorm, other IDEs (e.g., VSCode, Atom, etc.) and editors (e.g., Sublime) should be similar, or will at least be compatible with the command line options described above.

To run or test the system in WebStorm you will need to configure run targets. To run the system go to the ```Run->Edit Configurations``` and tap on the ```+``` and then ```Node.js```. Point the 'JavaScript file' argument to ```src/App.js```. To run the system tests, go to the ```Run->Edit Configurations``` and tap on the ```+``` and then ```Mocha```. Point the 'Test Directory' file argument to ```test/```.


